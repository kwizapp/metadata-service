import requests
import os
import pandas as pd

from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
assert DATABASE_URL is not None

POSTER_SERVICE_URL = os.getenv('POSTER_SERVICE_URL')
assert POSTER_SERVICE_URL is not None

# try to fetch a random movie to ensure the poster service is working
try:
    some_movie = requests.get(f"{POSTER_SERVICE_URL}/?id=tt3450958")
    assert some_movie.status_code == 200
except:
    raise ConnectionError()

# import dataset
movies_meta = pd.read_csv("datasets/the-movies-dataset/movies_metadata.csv")

# filter out foreign movies (not en or de)
movies_meta = movies_meta[movies_meta.original_language.isin(["en", "de"])]

# filter movies with NA in critical columns
for column in ["imdb_id", "title", "release_date", "popularity"]:
    movies_meta = movies_meta[movies_meta[column].isna() == False]

# filter adult movies
movies_meta = movies_meta[movies_meta.adult == "False"]

# sort the list by popularity
movies_meta["popularity"] = pd.to_numeric(movies_meta.popularity)
movies_meta = movies_meta.sort_values("popularity", ascending=False)

# drop unnecessary columns
movies_meta = movies_meta.drop(["adult", "belongs_to_collection", "id"], axis=1)

# find and purge duplicated imdb ids
movies_meta["is_duplicate"] = movies_meta.duplicated(["imdb_id"])
movies_meta = movies_meta[~movies_meta.is_duplicate]

# TODO: we might actually want to use these columns, but we do not save them to the DB in a first iteration!
movies_meta = movies_meta.drop(
    [
        "genres",
        "production_companies",
        "spoken_languages",
        "production_countries",
        "is_duplicate",
    ],
    axis=1,
)

# segment movies based on date buckets
def assign_date_bucket(row):
    as_dt = pd.to_datetime(row["release_date"])
    year = as_dt.year

    # before 1990
    if year < 1990:
        return 0

    # 1990-2005
    elif year < 2005:
        return 1

    # 2005-2020
    return 2


movies_meta["date_segment"] = movies_meta.apply(assign_date_bucket, axis=1)
movies_until_1990 = movies_meta[movies_meta["date_segment"] == 0]
movies_until_2005 = movies_meta[movies_meta["date_segment"] == 1]
movies_until_2020 = movies_meta[movies_meta["date_segment"] == 2]

# extract top50 from all segments
top50_until_1990 = movies_until_1990.iloc[0:50]
top50_until_2005 = movies_until_2005.iloc[0:50]
top50_until_2020 = movies_until_2020.iloc[0:50]
top50_all = pd.concat([top50_until_1990, top50_until_2005, top50_until_2020])


# check all movies in the top50 for consistency with omdb
def check_omdb_existence(row):
    try:
        result = requests.get(f"{POSTER_SERVICE_URL}/?id={row['imdb_id']}")
        return result.status_code == 200

    except ConnectionError:
        raise ConnectionError()

    except:
        return False


top50_all["omdb_consistent"] = top50_all.apply(check_omdb_existence, axis=1)

try:
    # setup a database connection
    engine = create_engine(DATABASE_URL, echo=True)

    # write the results to the database
    top50_all = top50_all.set_index("imdb_id")
    top50_all[top50_all["omdb_consistent"]].to_sql(
        "movies", con=engine, if_exists="replace"
    )

finally:
    # get rid of the connection pool
    engine.dispose()
