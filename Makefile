LIB = $(shell ls -l lib/*.js | awk -F '/' '{print "lib_min/"$$NF}')
UGLIFY_FLAGS = --no-mangle 
VERSION = 'v0.9'

all: test minify package

clean:
	@rm -rf lib_min
	@rm -rf js-dcpu16_workbench
	@rm -f test/assembler.test.gen.js
	@rm -f test/*.dat

test: clean
	@node test/generate_testcases.js 
	@mocha --ui exports

lib_min/%.js: lib/%.js
	@uglifyjs $< > $@ \

init_minify:
	@mkdir lib_min -p	
	
minify: init_minify $(LIB)
	
package: minify
	@mkdir js-dcpu16_workbench -p 
	@mkdir js-dcpu16_workbench/js -p 
	@mkdir js-dcpu16_workbench/js/codemirror -p 
	@mkdir js-dcpu16_workbench/lib -p
	@cp lib/font.png js-dcpu16_workbench/lib/font.png
	@cp lib_min/*.js js-dcpu16_workbench/lib/ 
	@cp js/*.js js-dcpu16_workbench/js/
	@cp js/codemirror/*.js js-dcpu16_workbench/js/codemirror
	@cp js/codemirror/*.css js-dcpu16_workbench/js/codemirror
	@sed 's/version:dev/version:$(VERSION)/' workbench.html > js-dcpu16_workbench/index.html
	@cp -r style js-dcpu16_workbench/style
	@tar czf js-dcpu16_workbench_$(VERSION).tar.gz js-dcpu16_workbench

.PHONY: test