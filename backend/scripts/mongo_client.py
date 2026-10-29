#!/usr/bin/env python3
"""Forwarder to database/mongo_client.py"""
import os
import sys

target = os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'mongo_client.py')
with open(target, 'r', encoding='utf-8') as f:
    code = compile(f.read(), target, 'exec')
    exec(code, {'__name__': '__main__', '__file__': target})
