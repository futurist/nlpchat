exports.testSomething = function(test){
    console.log(111111111)
    setTimeout(function(){
        test.expect(1);
        test.ok(true, "this assertion should pass");
        test.done();
    }, 3000)
};

exports.testSomethingElse = function(test){
    console.log(2222222)
    setTimeout(function(){
        test.ok(false, "this assertion should fail");
        test.done();
    }, 5000)
};


