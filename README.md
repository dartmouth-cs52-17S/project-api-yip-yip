# Yip Yip API

### Overview
This is the API part of the Yip Yip application that we are making for CS52. The root URL is https://yip-yip.herokuapp.com/api.
Working example [here](http://yip-yip.herokuapp.com/api/posts/?long=5.000001&lat=6.000001)!!

### Possible Actions
- UPVOTE_POST
- DOWNVOTE_POST
- UPVOTE_COMMENT
- DOWNVOTE_COMMENT
- CREATE_COMMENT

### Testing
For testing the API, try some `curl` calls.

An example of a post ID is `59249187ff5aa5002228092e`.

- create new post
```shell
curl -X POST -H "Content-Type: application/json" -d '{
    "text": "yooo~ what's new here?",
    "tags": "#newbieInTown",
    "coordinates":  [5, 6],
    "user_id": "603 123 1279"
}' "https://yip-yip.herokuapp.com/api/posts"
```

- fetch by POSTID
```shell
curl -X GET "https://yip-yip.herokuapp.com/api/posts/POSTID"
```

- delete by POSTID
```shell
curl -X DELETE "https://yip-yip.herokuapp.com/api/posts/POSTID"
```


### Contributers
- Armin Mahban
- Byrne Hollander
- Ellis Guo
- Jenny Seong
- Ying Liu
