wifi.setmode(wifi.STATION)
wifi.sta.config{ssid="wzycs7017",pwd="wzyswez7017"}
led1 = 0    --开门信号灯pin0
led2 = 4    --拒绝访问信号灯pin4
button = 3      --开门请求按钮pin3
gpio.write(led1, gpio.HIGH)     --高电平为灯灭 
gpio.write(led2, gpio.HIGH)
gpio.mode(led1, gpio.OUTPUT)
gpio.mode(led2, gpio.OUTPUT)
gpio.mode(button, gpio.INT, gpio.PULLUP)    --将pin3设为中断模式
        
function receiver(socket, string)    --获取TLS服务器返回数据时的回调
    print(string)
    if (string == '1') then
        gpio.write(led1, gpio.LOW)
        tmr.delay(3000000)  --延时3s，开门信号结束
        gpio.write(led1, gpio.HIGH)
    elseif (string == '2') then
        gpio.write(led2, gpio.LOW)
        tmr.delay(3000000)  --延时3s，拒绝访问信号结束
        gpio.write(led2, gpio.HIGH)
    end
end

tmr.alarm(1, 1000, tmr.ALARM_AUTO, function()   --将nodeMCU连入wifi，并获取IP地址
    if wifi.sta.getip() == nil then
        print('Waiting for IP ...')
    else
        print('IP is ' .. wifi.sta.getip())
        sv = tls.createConnection()      --连入网络后，建立一个TLS客户端
        sv:connect(8080, "192.168.1.101")    --连接到用nodejs建立的TLS服务器
        sv:on('connection', function(sck, c)
            sv:send('TEST-CLIENT')      --第一次连入服务器时发送自己的身份
        end)
        sv:on("receive", receiver)      --注册回调事件
        tmr.stop(1)
    end
end)

function ledTrg()   --pin3低电平产生中断时的回调
    local i = gpio.read(button)
    local cnt = 0
    tmr.alarm(1, 1000, tmr.ALARM_AUTO, function()
        if i == 0 and cnt == 0 then
            sv:send('open')
            cnt = cnt + 1
        else
            cnt = 0
            tmr.stop(1)
        end
    end
    )
end

gpio.trig(button, "low", ledTrg)
