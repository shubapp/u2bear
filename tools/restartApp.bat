timeout /t 5 /nobreak
del /F /Q %1\*
for /D /R %1 %%a in (*) do (if /I NOT '%%a' == '%1\videos' (if /I NOT '%%a' == '%1\images' (if /I NOT '%%a' == '%1\songs' (rd /S /Q %%a))))
xcopy /E /I /Y %2 %1
call "%~1\%~3"