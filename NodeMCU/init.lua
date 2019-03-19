uart.setup(0, 19200, 8, uart.PARITY_NONE, uart.STOPBITS_1, 0)
uart.setup(1, 115200, 8, uart.PARITY_NONE, uart.STOPBITS_1, 0)
uart.write(1, "hellow")     --work
t = require("tools")

wifi.setmode(wifi.STATION)
wifi.sta.config{ssid="sdy151531",pwd="Wzy19970515"}
led1 = 0    --开门信号灯pin0
led2 = 4    --拒绝访问信号灯pin4
collectButton = 3      --采集指纹特征值按钮pin3
touch = 1          --指纹模块按压信号pin1
fpcVCC = 2         --指纹模块指纹模组电压pin2
gpio.write(led1, gpio.HIGH)     --高电平为灯灭 
gpio.write(led2, gpio.HIGH)
gpio.write(fpcVCC, gpio.LOW)    --将fpcVCC置低电平
gpio.mode(led1, gpio.OUTPUT)
gpio.mode(led2, gpio.OUTPUT)
gpio.mode(collectButton, gpio.INT, gpio.PULLUP)    --将pin3设为中断模式
gpio.mode(touch, gpio.INT)        --将pin1设为中断模式      
gpio.mode(fpcVCC, gpio.OUTPUT)
function receiver(socket, string)    --获取TLS服务器返回数据时的回调
    --print(string)
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
        --print('Waiting for IP ...')
        uart.write(1, "Waiting for IP ...")     --doesn't work(可能pin4作为拒绝访问信号灯导致 !todo)
    else
        --print('IP is ' .. wifi.sta.getip())
        uart.write(1, "IP is" .. wifi.sta.getip())      --doesn't work
        sv = tls.createConnection()      --连入网络后，建立一个TLS客户端
        sv:connect(8080, "192.168.43.175")    --连接到用nodejs建立的TLS服务器
        uart.on("data", 215, function(data)   --注册串口收到数据时的回调
                local collect = gpio.read(collectButton)
                if collect == 0 then
                    sv:send("R " .. t.bin2hex(data))               --若采集指纹按钮按下，则视为指纹采集(collect)，将串口接收到的二进制数据转为hex字符串通过wifi传给服务器
                else
                    sv:send("C " .. t.bin2hex(data))               --若采集指纹按钮未按下，则视为指纹识别(recognition)，将串口接收到的二进制数据转为hex字符串通过wifi传给服务器
                end
                if data == "quit" then
                    uart.on("data")     --unregister callback function
                end
        end, 0)
        sv:on('connection', function(sck, c)
            sv:send('TEST-CLIENT')      --第一次连入服务器时发送自己的身份
        end)
        sv:on("receive", receiver)      --注册回调事件
        tmr.stop(1)
    end
end)

function collectTrg()   --pin3产生下降沿时的回调
    uart.write(0, 0xf5, 0x23, 0x00, 0x00, 0x00, 0x00, 0x23, 0xf5)       --给指纹模块发送指令，返回指纹特征值
end

function touchTrg()   --当指纹模块受到按压时输出高电平，指纹模块指纹模组供电6s，led2亮6s
    --local sendTimer = tmr.create()
    --local cutPowerTimer = tmr.create()
    gpio.write(led2, gpio.LOW)
    gpio.write(fpcVCC, gpio.HIGH)
    tmr.delay(500000)
    uart.write(0, 0xf5, 0x23, 0x00, 0x00, 0x00, 0x00, 0x23, 0xf5)
    --tmr.alarm(sendTimer, 500, tmr.ALARM_SINGLE, function()         --延时0.5s后发送返回特征值命令
        --uart.write(0, 0xf5, 0x23, 0x00, 0x00, 0x00, 0x00, 0x23, 0xf5)       --给指纹模块发送指令，返回指纹特征值
    --end)
    --tmr.alarm(cutPowerTimer, 4000, tmr.ALARM_SINGLE, function()         --延时4s后断电
        --gpio.write(fpcVCC, gpio.LOW)
        --gpio.write(led2, gpio.HIGH)
    --end)
    tmr.delay(2000000)
    gpio.write(fpcVCC, gpio.LOW)
    gpio.write(led2, gpio.HIGH)
end

--gpio.trig(collectButton, "down", collectTrg)     --下降沿触发上传指纹特征值引脚
gpio.trig(touch, "high", touchTrg)      --上升沿触发对比指纹特征值引脚