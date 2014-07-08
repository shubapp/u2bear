How to build (windows)
======================
1) Go to release directory (or create one with all [necessary files](https://github.com/rogerwang/node-webkit/wiki/How-to-package-and-distribute-your-apps))
```batch
cd F:\git\temp\release
```
2) Delete u2bear.nw and u2bear.exe
```batch
rm u2bear.nw
rm u2bear.exe
```
3) Zip app folder's content to u2bear.zip in the release directory
```batch
7z F:\git\youtuber F:\git\temp\release\u2bear.zip
```
4) Delete videos, songs, git and images directories from the zip

5) Copy & rename u2bear.zip to u2bear.nw
```batch
cp u2bear.zip u2bear.nw
```
6) Create an executable
```batch
copy /b nw.exe+u2bear.nw u2bear.exe
```
7) Move u2bear.exe to ship directory
```batch
mv u2bear.exe ship/u2bear.exe
```
8) Delete content of videos, songs and images directories inside ship directory
```batch
rm -R ship/videos ship/songs ship/images
```
9) Done!