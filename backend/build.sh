#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python create_super_admin.py
