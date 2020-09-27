#!/bin/bash

npm run build-client && npm run build-server
forever stop 0
npm run daemon
