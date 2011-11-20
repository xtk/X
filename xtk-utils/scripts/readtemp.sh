#!/bin/bash

while read line;
do
if [[ $line == *Scanning* ]]
then
  echo -e "\033[0;33m $line \033[00m";
elif [[ $line == *scanned* ]]
then
  echo -e "\033[0;33m $line \033[00m";
elif [[ $line == *Building* ]]
then
  echo -e "\033[0;35m $line \033[00m";
elif [[ $line == *following* ]]
then
  echo -e "\033[0;35m $line \033[00m";
elif [[ $line == *ERROR* ]]
then
  echo -e "\033[0;31m $line \033[00m";
elif [[ $line == *WARNING* ]]
then
  echo -e "\033[0;93m $line \033[00m";
else
  echo $line;
fi

done < $1
