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
        test('./tests/tests.js', step.next)
    (step, err)->
        console.log('Ran "tests.js"!')
]

task 'build', 'compiles src/unify.coffee to lib/unify.js', ->
    funcflow(buildSteps, {catchExceptions:false}, ()->)

task 'build:min', 'compiles src/unify.coffee to lib/unify.js and then runs UglifyJS on it', ->
    funcflow(buildSteps.concat(buildMinSteps),{catchExceptions:false}, ()->)

task 'build:full', 'compiles src/unify.coffee, runs all tests, and minifies', ->
    funcflow(buildSteps.concat(buildMinSteps, testSteps),{catchExceptions:false}, ()->)
    
task 'test', 'compiles src/unify.coffee to lib/unify.js', ->
    funcflow(buildSteps.concat(testSteps), {catchExceptions:false}, ()->)
    
compile = (inputFile, callback) ->
    coffee = require 'coffee-script'
    callback?(coffee.compile(inputFile))

compress = (inputFile, callback) ->
    uglify = require "uglify-js"
    ast = uglify.parser.parse(inputFile); # parse code and get the initial AST
    ast = uglify.uglify.ast_mangle(ast); # get a new AST with mangled names
    ast = uglify.uglify.ast_squeeze(ast); # get an AST with compression optimizations
    callback?(uglify.uglify.gen_code(ast))
    
readFile = (filename, callback) ->
    data = fs.readFile(filename, 'utf8', (err, data)-> if err then throw err else callback(data))
 
writeFile = (filename, data, callback) ->
    fs.writeFile(filename, data, 'utf8', (err)-> if err then throw err else callback())

test = (inputFile, callback) ->
    tests = require(inputFile)
    tests.RunAll()
    callback()