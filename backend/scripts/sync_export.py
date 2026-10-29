#!/usr/bin/env python3
"""Forwarder to database/sync_export.py"""
import os
import sys

target = os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'sync_export.py')
with open(target, 'r', encoding='utf-8') as f:
    code = compile(f.read(), target, 'exec')
    exec(code, {'__name__': '__main__', '__file__': target})
