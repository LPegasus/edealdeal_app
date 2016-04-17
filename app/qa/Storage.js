describe('服务: localStorage', function() {
  beforeEach(module('starter.services'));

  var storageSvr;

  var obj = { "name": "LPEGASUS", "age": 18, "birthday": new Date(1988, 11, 15) };
  var obj_Timeout = {"name": "TIMEOUT", "birthday": new Date() };

  beforeEach(inject(function(_LPStorage_) {
    storageSvr = _LPStorage_;
    storageSvr.setItem("ME", obj, 60000);
    storageSvr.setItem("TIMEOUT", obj_Timeout, new Date(2016,0,1,0,0,0))
  }));

  it('can get from localStorage', function(){
    var _obj = storageSvr.getItem('ME');
    expect(_obj.data).toEqual({
      "name": "LPEGASUS",
      "age": 18,
      "birthday": new Date(1988, 11, 15)
    });
  });

  it(`timeout data will be removed when [storage.getItem] func's been called`, function(){
    var _obj = localStorage.getItem('TIMEOUT');
    expect(_obj).toBeTruthy();
    _obj = storageSvr.getItem('TIMEOUT');//过期数据在执行getItem时会自动清除
    expect(_obj).toBeFalsy();
  });
  
  it(`clearTimeoutItem func test`, function(){
    debugger;
    storageSvr.clearTimeoutItem();
    expect(localStorage.getItem('TIMEOUT')).toBeFalsy();
  });
});