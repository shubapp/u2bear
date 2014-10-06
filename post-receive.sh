#!/bin/sh
GIT_WORK_TREE=/home/ec2-user/u2bear/
export GIT_WORK_TREE
git checkout -f
cd $GIT_WORK_TREE
npm install
cd ~/u2bearbuilder/
./build