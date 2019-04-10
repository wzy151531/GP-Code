uart.setup(0, 19200, 8, uart.PARITY_NONE, uart.STOPBITS_1, 0)
uart.setup(1, 115200, 8, uart.PARITY_NONE, uart.STOPBITS_1, 0)
uart.write(1, "hellow")     --work
t = require("tools")

wifi.setmode(wifi.STATION)
wifi.sta.config{ssid="wzycs7017",pwd="wzyswez7017"}
led1 = 0    --信号灯pin0
led2 = 4    --信号灯pin4
collectButton = 3      --按钮pin3
gpio.write(led1, gpio.HIGH)     --高电平为灯灭 
gpio.write(led2, gpio.HIGH)
gpio.mode(led1, gpio.OUTPUT)
gpio.mode(led2, gpio.OUTPUT)
clientName = ''

function receiver(socket, string)    --获取TLS服务器返回数据时的回调
    local stringList = t.split(string, '|')     --将从服务器收到的数据以'|'分割放入数组
    local featureList = t.split(stringList[3], ' ')     --将特征值以空格分割放入数组
    local i
    local len = table.getn(featureList)
    if stringList[1] == 'C' then        --将获取到的特征值存入指纹模块
        clientName = 'X'
        local CHKList = {}      --计算数据包异或值时需要传入的数组
        uart.write(0, 0xf5, 0x41, 0, tonumber(stringList[2]), 0, 0, t.CmdGenCHK({0x41, 0, tonumber(stringList[2], 0, 0)}, 0xf5, 0xf5, 0, tonumber(stringList[2]), 1))
        table.insert(CHKList, tonumber(stringList[2]))
        table.insert(CHKList, 1)
        for i = 1, len do
            uart.write(0, tonumber(featureList[i], 16))
            table.insert(CHKList, tonumber(featureList[i], 16))
        end
        uart.write(0, t.CmdGenCHK(CHKList), 0xf5)
    elseif stringList[1] == 'R' then        --将获取到的特征值与指纹模块数据库中数据进行匹配
        clientName = stringList[2]
    end
end

tmr.alarm(1, 1000, tmr.ALARM_AUTO, function()   --将nodeMCU连入wifi，并获取IP地址
    if wifi.sta.getip() == nil then
        --print('Waiting for IP ...')
        gpio.write(led2, (gpio.read(led2) + 1) % 2)     --等待接入wifi时，led2闪烁
    else
        --print('IP is ' .. wifi.sta.getip())
        gpio.write(led2, gpio.HIGH)      --连入网络后，led2熄灭
        sv = tls.createConnection()      --连入网络后，建立一个TLS客户端
        sv:connect(8080, "192.168.1.101")    --连接到用nodejs建立的TLS服务器
        uart.on("data", 8, function(data)   --注册串口收到数据时的回调
            sv:send(clientName .. t.bin2hex(data))
            if data == "quit" then
                uart.on("data")     --unregister callback function
            end
        end, 0)
        sv:on('connection', function(sck, c)
            sv:send('MATCHING')      --第一次连入服务器时发送自己的身份
        end)
        sv:on("receive", receiver)      --注册回调事件
        tmr.stop(1)
    end
end)
