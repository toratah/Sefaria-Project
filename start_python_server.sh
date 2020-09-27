#!/bin/bash

nohup python manage.py runserver 0.0.0.0:80 > ../sefaria_python.out 2>&1
