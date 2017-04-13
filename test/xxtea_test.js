describe('XXTEA', function(){
  describe('#encryptToBase64()', function(){
    it('should return encrypt data in base64', function(){
        var str = "Hello World! 你好，中国🇨🇳！";
        var key = "1234567890";
        var encrypt_data = XXTEA.encryptToBase64(str, key);
        assert(encrypt_data == "D4t0rVXUDl3bnWdERhqJmFIanfn/6zAxAY9jD6n9MSMQNoD8TOS4rHHcGuE=");
    });
  });
  describe('#decryptFromBase64()', function(){
    it('should return decrypt data in string', function(){
        var str = "Hello World! 你好，中国🇨🇳！";
        var key = "1234567890";
        var encrypt_data = "D4t0rVXUDl3bnWdERhqJmFIanfn/6zAxAY9jD6n9MSMQNoD8TOS4rHHcGuE=";
        var decrypt_data = XXTEA.decryptFromBase64(encrypt_data, key);
        assert(str === decrypt_data);
    });
  });
  describe('#decryptData()', function() {
    it('should return decrypted data', function() {
      var key = [1,2,3,4]
      var encrypt_data = [3294166544,1357551160,2321673513,2182648670,4260825296]
      var actual = XXTEA.decryptUint32Array(encrypt_data, key)
      var expected = [1272, 1438, 368, 303, 632] 
      assert(actual[0] === expected[0])
      assert(actual[1] === expected[1])
      assert(actual[2] === expected[2])
      assert(actual[3] === expected[3])
      assert(actual[4] === expected[4])
    });
  });
});
