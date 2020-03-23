#!/usr/bin/env python
# coding: utf-8

# # Dependencies

# In[1]:


import pandas as pd


# # Data Import and Cleanup

# In[2]:


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

movies_meta.head(2)


# In[3]:


# find and purge duplicated imdb ids
movies_meta["is_duplicate"] = movies_meta.duplicated(["imdb_id"])
movies_meta = movies_meta[~movies_meta.is_duplicate]
max(movies_meta.imdb_id.value_counts())


# In[4]:


# TODO: we might actually want to use these columns, but we do not save them to the DB in a first iteration!
movies_meta = movies_meta.drop(["genres", "production_companies", "spoken_languages", "production_countries", "is_duplicate"], axis=1)


# # Segmentation based on Release Date

# In[5]:


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
movies_meta.head(2)


# In[6]:


# movies_meta.info()


# In[7]:


movies_until_1990 = movies_meta[movies_meta["date_segment"] == 0]
movies_until_1990.head(2)


# In[8]:


movies_until_2005 = movies_meta[movies_meta["date_segment"] == 1]
movies_until_2005.head(2)


# In[9]:


movies_until_2020 = movies_meta[movies_meta["date_segment"] == 2]
movies_until_2020.head(2)


# # Extract Top50

# In[10]:


top50_until_1990 = movies_until_1990.iloc[0:50]
top50_until_1990.head(2)


# In[11]:


top50_until_2005 = movies_until_2005.iloc[0:50]
top50_until_2005.head(2)


# In[12]:


top50_until_2020 = movies_until_2020.iloc[0:50]
top50_until_2020.head(2)


# # Ensure Consistency with Poster-Service

# In[13]:


import requests


# In[14]:


top50_all = pd.concat([top50_until_1990, top50_until_2005, top50_until_2020])


# In[15]:


top50_all.head(2)


# In[24]:


def check_omdb_existence(row):
    try:
        result = requests.get(f"http://localhost:3000/?id={row['imdb_id']}")
        return result.status_code == 200
    except:
        return False

top50_all["omdb_consistent"] = top50_all.apply(check_omdb_existence, axis=1)


# In[25]:


top50_all[~top50_all["omdb_consistent"]]


# # Hydrate Database

# In[26]:


# conda install sqlalchemy, psycopg2
# pip install python-dotenv

import os

from sqlalchemy import create_engine
from dotenv import load_dotenv
load_dotenv()


# In[27]:


engine = create_engine(os.getenv("DATABASE_URL"), echo=True)


# In[30]:


top50_all = top50_all.set_index("imdb_id")
top50_all[~top50_all["omdb_consistent"]].to_sql("movies", con=engine, if_exists="replace")


# In[ ]:




