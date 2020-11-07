#!/usr/bin/env sh

SQL_DIR=$(dirname $0)
echo "SQL_DIR=$SQL_DIR"

if [ -f $1 ]; then
	echo "db file $1 already exists"
	exit 1
fi

for file in $(ls $SQL_DIR/*.sql | sort); do
	echo sqlite3 $1 -init $file
	echo "" | sqlite3 $1 -init $file
done
