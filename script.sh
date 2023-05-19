# country=$(sort-package-json "package.json" --check )
sort-package-json "**/cactus-*/package.json" --check 

if [ $? -eq 0 ]
then
    echo 'Each package was already sorted.'
	exit 0
else 
    echo 'At least one package was not sorted 
run /tools/custom-checks/check-package-json-sort.ts or "npm run custom-checks"'
	exit 1
fi