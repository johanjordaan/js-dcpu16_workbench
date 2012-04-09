SRC = $(shell find lib -name "*.js" -type f)
UGLIFY_FLAGS = --no-mangle 

all: ejs.min.js

test: clean
	@node test/generate_testcases.js 
	@mocha --ui exports

ejs.js: $(SRC)
	@node support/compile.js $^

ejs.min.js: ejs.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
		&& du ejs.min.js \
		&& du ejs.js

clean:
	@rm -f test/assembler.test.gen.js
	@rm -f test/*.dat

.PHONY: test