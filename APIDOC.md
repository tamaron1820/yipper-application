# Yipper API Documentation
*This API provides endpoints for managing a yipper application.*

## *Fetch All Yips*
**Request Format:** */yipper/yips*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *If the search parameter is not included in the request, your service should get the id, name, yip, hashtag, likes and date from the yips table and outputs JSON containing the information in the order of dates in descending order (Pass the date into the DATETIME() function in your ordering statement).*


**Example Request:** *GET /yipper/yips*

**Example Response:**
```json
{
  "yips":[
    {
      "id": 25,
      "name": "Mister Fluffers",
      "yip": "It is sooooo fluffy I am gonna die",
      "hashtag": "fluff",
      "likes": 6,
      "date": "2020-07-07 03:48:28"
    },
    {
      "id": 24,
      "name": "Sir Barks a Lot",
      "yip": "Imagine if my name was sir barks a lot and I was meowing all day haha",
      "hashtag": "clown",
      "likes": 6,
      "date": "2020-07-06 00:55:08"
    },
    ...
  ]
}

```

**Error Handling:**
*If an error occurs on the server, a response with status code 500 and a message indicating a server error is returned.*

## *Fetch User Yips*
**Request Format:** */yipper/user/:user*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Your service should get the name, yip, hashtag and date for all the yips for a designated user ordered by the date in descending order (Pass the date into the DATETIME() function in your ordering statement). The user should be taken exactly as passed in the request.*

**Example Request:** *GET /yipper/user/Chewbarka*

**Example Response:**
```json
[
  {
    "name": "Chewbarka",
    "yip": "chewy or soft cookies. I chew them all",
    "hashtag": "largebrain",
    "date": "2020-07-09 22:26:38",
  },
  {
    "name": "Chewbarka",
    "yip": "Every snack you make every meal you bake every bite you take... I will be watching you.",
    "hashtag": "foodie",
    "date": "2019-06-28 23:22:21"
  }
]
```

**Error Handling:**
If the user does not exist, a response with the status code 400 and the message "Yikes. User does not exist." is returned.

## *Increase Yip Likes*
**Request Format:** */yipper/likes*

**Request Type:** *POST*

**Returned Data Format**: plain text

**Description:** *Your service should update the likes for a yip (the yip your service is updating is determined by the id passed through the body) by incrementing the current value by 1 and responding with the new value.*

**Example Request:** *POST /yipper/likes*

**Example Response:**
```
8
```

**Error Handling:**
If the id does not exist, a response with the status code 400 and the message "Yikes. ID does not exist." is returned.

## *Post New Yip*
**Request Format:** */yipper/new*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Your service should add the new Yip information to the database and send back and output the JSON with the id, name, yip, hashtag, likes and date. The id should correspond with the auto-incremented id generated from inserting into the database. In your Node app, the newly generated id can be retrieved by using the lastID property on the result of the query. The name of the user added to the database should be grabbed from the name body parameter. The likes should be set to 0, and the yip and hashtag information can be obtained from the full body parameter. The date should be the current date (the yips table schema will default to the current datetime upon a new inserted row).Your service should add the new Yip information to the database and send back and output the JSON with the id, name, yip, hashtag, likes and date. The id should correspond with the auto-incremented id generated from inserting into the database. In your Node app, the newly generated id can be retrieved by using the lastID property on the result of the query. The name of the user added to the database should be grabbed from the name body parameter. The likes should be set to 0, and the yip and hashtag information can be obtained from the full body parameter. The date should be the current date (the yips table schema will default to the current datetime upon a new inserted row).*

**Example Request:** *POST /yipper/new*

**Example Response:**
```json
{
  "id": 528,
  "name": "Chewbarka",
  "yip": "love to yip allllll day long",
  "hashtag": "coolkids",
  "likes": 0,
  "date": "2020-09-09 18:16:18"
}
```

**Error Handling:**
If the user does not exist, a response with the status code 400 and the message "Yikes. User does not exist." is returned. Also, if the required parameters are missing, a response with the status code 400 and the message "Missing one or more of the required params." is returned.
