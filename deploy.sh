#!/bin/bash
if test "$*"
then
    ./commit.sh $*
fi
git push heroku master
