fs = require 'fs'
funcflow = require 'funcflow'

buildSteps = [
    (step, err)->readFile('./src/unify.coffee', step.next)
    (step, err, file)->compile(file, step.next)
    (step, err, file)->writeFile('./lib/unify.js', file, step.next)
    (step, err)->
        console.log('Compiled "unify.js"!')
        step.next()
    ]
    
buildMinSteps = [
    (step, err)->readFile('./lib/unify.js', step.next)
    (step, err, file)->compress(file, step.next)
    (step, err, file)->writeFile('./lib/unify.min.js',  file, step.next)
    (step, err)->
            console.log('Compiled "unify.min.js"!')
            step.next()
]

testSteps = [
    (step, err)->
        console.log('Compiling "tests.coffee"!')
        readFile('./tests/tests.coffee', step.next)
    (step, err, file)->compile(file, step.next)
    (step, err, file)->writeFile('./tests/tests.js', file, step.next)
    (step, err)->
        console.log('Compiled "tests.js"!')
        console.log('Running "tests.js"!')
        test('./tests/tests.js', step.options.exception, step.next)
    (step, err)->
        console.log('Ran "tests.js"!')
]

task 'build', 'compiles src/unify.coffee to lib/unify.js', (options)->
    funcflow(buildSteps, {catchExceptions:false, "options":options}, ()->)

task 'build:min', 'compiles src/unify.coffee to lib/unify.js and then runs UglifyJS on it', (options)->
    funcflow(buildSteps.concat(buildMinSteps),{catchExceptions:false, "options":options}, ()->)

option '-e', '--exception', "don't catch exceptions when running unit tests"
task 'build:full', 'compiles src/unify.coffee, runs all tests, and minifies', (options)->
    funcflow(buildSteps.concat(buildMinSteps, testSteps),{catchExceptions:false, "options":options}, ()->)
    
task 'test', 'compiles src/unify.coffee to lib/unify.js and then runs all the unit tests', (options)->
    funcflow(buildSteps.concat(testSteps), {catchExceptions:false, "options":options}, ()->)
    
compile = (inputFile, callback) ->
    coffee = require 'coffee-script'
    callback?(coffee.compile(inputFile))

compress = (inputFile, callback) ->
    UglifyJS = require "uglify-js"
    toplevel = UglifyJS.parse(inputFile)
    toplevel.figure_out_scope()
    compressor = UglifyJS.Compressor()
    compressed_ast = toplevel.transform(compressor)
    compressed_ast.figure_out_scope()
    compressed_ast.compute_char_frequency()
    compressed_ast.mangle_names()
    callback?(compressed_ast.print_to_string())
    
readFile = (filename, callback) ->
    data = fs.readFile(filename, 'utf8', (err, data)-> if err then throw err else callback(data))
 
writeFile = (filename, data, callback) ->
    fs.writeFile(filename, data, 'utf8', (err)-> if err then throw err else callback())

test = (inputFile, throwException, callback) ->
    tests = require(inputFile)
    #tests["simple no var bind test"]()
    tests.RunAll(throwException)
    callback()