.PHONY: lint lint-fix

lint:
	npx eslint .

lint-fix:
	npx eslint --fix .
