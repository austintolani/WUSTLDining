"""

The purpose of this program is to write to a MongoDB database with data representing the dishes that are being served by relevant locations on WU's campus at the given time.
It does this by using BeautifulSoup to scrape WU's Dining Services Website.

Created by Austin Tolani

"""



# Import relevant libraries. Note: BeautifulSoup,pymongo and Requests must be installed using 'pip install x'. 

import requests 
from bs4 import BeautifulSoup
import re
import json
import pymongo
from datetime import date

# Connect to Mongo client

myClient = pymongo.MongoClient("mongodb://localhost:27017/")
myDB = myClient["wustl"]
myCol = myDB["recipes"]

# Locations and their respective URLs
locations = {
    "The Village - Comfort" : "http://menus.wustl.edu/shortmenu.asp?sName=+&locationNum=60%28b%29&locationName=THE+VILLAGE+%2D+Comfort&naFlag=1",
    "BEAR'S DEN - WUrld Fusion": "http://menus.wustl.edu/shortmenu.asp?sName=+&locationNum=73%28d%29&locationName=BEAR%27S+DEN+%2D+WUrld+Fusion&naFlag=1",
    "Law Cafe" : "http://menus.wustl.edu/shortmenu.asp?sName=+&locationNum=44&locationName=+LAW+CAF%26Eacute%3B&naFlag=1"
    }

    
# Meal Categories. Only recipies with matching meal categories will be considered

lunchCategories = ["-- EXPRESS LUNCH ENTREE --", "-- EXPRESS LUNCH SIDE --","-- LUNCH ENTREE --","-- LUNCH SIDE --","-- DAILY SOUP --","-- DAILY PIZZA --"]
dinnerCategories = ["-- COMFORT ENTREE --","-- COMFORT SIDE --","-- HALAL VEGETARIAN ENTREE --", "-- HALAL MEAT ENTREE --","-- HALAL SIDE --"]

# Final Dictionary to be converted to JSON
outputJSON = {}

# Iterate over all locations
for location in locations:

    #Set up soup
    page = requests.get(locations[location])
    soup = BeautifulSoup(page.text, 'html.parser')

    #Find all short menu categories
    shortMenuCats = soup.find_all('div',{"class": "shortmenucats"})

    # Iterate over all categories
    for category in shortMenuCats:
        categoryName = category.next_element.string
        # Make sure that the category is a desired one
        if (categoryName in lunchCategories or categoryName in dinnerCategories):

            mealType = "Lunch"
            if (categoryName in dinnerCategories):
                mealType = "Dinner"

            #Get parent element of category, this is necessary to find the relevant recipe divs. 
            recipeRow = category.parent.parent
            #Check to make sure a div exists and if it does, make sure it is a recipe div (indicated by the class name)
            while (recipeRow.next_sibling.next_sibling is not None and recipeRow.next_sibling.next_sibling.div['class'][0] == 'shortmenurecipes'):
                #Find the next recipe 
                recipeRow = recipeRow.next_sibling.next_sibling
                #Set variables for their name and description. The description is taken by scraping the onmouseover attribute
                name = recipeRow.div.string
                description = re.findall(r"'(.*?)'",recipeRow.div.next_element['onmouseover'])[0]
                # If there is no description available, change the description 
                if (description == ""):
                    description = "No description is available for this dish."
                # Check to see if the meal is already in the database
                key = {"name": name, "location": location}
                if (myCol.find(key).count() > 0 ):
                    # If the meal exists, only update the date, description, mealType and category, everything else (most importantly the comments and ratings) will stay the same
                    myCol.update_one(key,{'$set':{"date": date.today().strftime("X%m/X%d/%Y").replace('X0','X').replace('X',''),"description":description,"mealType":mealType,"category":categoryName}})
                #If the meal does not exist in the database, create a new entry for it
                else:
                    #Dictionary representing data for a single recipe
                    recipeDict = {"name":name,"date": date.today().strftime("X%m/X%d/%Y").replace('X0','X').replace('X',''),"location":location,"description": description,"category":categoryName,"mealType":mealType, "ratings": {},"avgRating" : -1,"comments":[]}
                    #Insert into mongo database
                    myCol.insert_one(recipeDict)
                



