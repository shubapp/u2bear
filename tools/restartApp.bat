timeout /t 5 /nobreak
rd /S /Q %1
xcopy /E /I /Y %2 %1
call "%~1\%~3"