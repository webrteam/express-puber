var fs = require("fs");
var {isFunction} = require("util");
var {requireJson,cmd,getCmd} = require("ifun");

//获取配置信息
exports.getConfig = function(args, ua) {
    var configFile = `${args.dir||ua.path}/config/pub.js`;
    var config = {
        pub: requireJson(configFile)
    };
    if (isFunction(config)) {
        config = config(args,ua);
    }
    config.args = args;
    config.ua = ua;
    return config;
};

//获取进程ID
//如找不到pid返回0
exports.getPid = function(keywords){
    var ps = process.platform=="linux" ? "ps -aux" : "ps aux";
    var stdout = getCmd(ps);

    var plist = stdout.split('\n');
    var pid = 0;
    plist.some(function(line) {
        var isMatch = keywords.every(function(keyword){
            //临时兼容
            if(keyword=="deploy"){
                return line.includes(keyword) || line.includes("pub_server");
            }
            return line.includes(keyword);
        });
        if(isMatch) {
            var _pid = line.trim().split(/\s+/)[1];
            if(_pid == process.pid){
                isMatch = false;
            }else{
                pid = _pid;
            }
        }
        return isMatch;
    });
    return pid;
};

//杀进程
exports.kill = function(pid){
    cmd(`kill -9 ${pid}`);
};

//解压缩
exports.unTar = function(tarFile, unTarDir){
    cmd(`tar -zxf ${tarFile} -C ${unTarDir}/`.replace(/\/\/$/,"/"));
};

//获取IP
exports.getIp = function(){
    try{
        var ips = os.networkInterfaces();
        for(var k in ips) {
            if(/en|eth/.test(k)) {
                var a = ips[k];
                for (var j = 0; j < a.length; j++) {
                    var o = a[j];
                    if (o.family == "IPv4" && o.internal === false) {
                        return o.address;
                    }
                }
            }
        }
    }catch(e){
        return "localhost";
    }
};