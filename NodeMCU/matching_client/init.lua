uart.setup(0, 19200, 8, uart.PARITY_NONE, uart.STOPBITS_1, 0)
uart.setup(1, 115200, 8, uart.PARITY_NONE, uart.STOPBITS_1, 0)
t = require("tools")

wifi.setmode(wifi.STATION)
wifi.sta.config{ssid="wzycs7017",pwd="wzyswez7017"}
led1 = 0
led2 = 4
collectButton = 3
gpio.write(led1, gpio.HIGH) 
gpio.write(led2, gpio.HIGH)
gpio.mode(led1, gpio.OUTPUT)
gpio.mode(led2, gpio.OUTPUT)
clientName = ''

function receiver(socket, string)
    local stringList = t.split(string, '|')
    local type = stringList[1]
    local counter = stringList[2]
    local featureString = stringList[3]
    stringList = nil
    collectgarbage("collect")
    local featureList = t.split(featureString, ' ')
    local i
    local len = table.getn(featureList)
    if type == 'C' then
        clientName = 'X'
        local CHKList = {}
        uart.write(0, 0xf5, 0x41, 0, tonumber(counter), 0, 0, t.CmdGenCHK({0x41, 0, tonumber(counter), 0, 0}), 0xf5, 0xf5, 0, tonumber(counter), 1)
        table.insert(CHKList, tonumber(counter))
        table.insert(CHKList, 1)
        for i = 1, len do
            uart.write(0, tonumber(featureList[i], 16))
            table.insert(CHKList, tonumber(featureList[i], 16))
        end
        uart.write(0, t.CmdGenCHK(CHKList), 0xf5)
    elseif type == 'R' then
        clientName = counter
    end
end

tmr.alarm(1, 1000, tmr.ALARM_AUTO, function()
    if wifi.sta.getip() == nil then
        gpio.write(led2, (gpio.read(led2) + 1) % 2)
    else
        gpio.write(led2, gpio.HIGH)
        sv = tls.createConnection()
        sv:connect(8080, "192.168.1.101")
        uart.on("data", 8, function(data)
            sv:send(clientName .. t.bin2hex(data))
            if data == "quit" then
                uart.on("data")
            end
        end, 0)
        sv:on('connection', function(sck, c)
            sv:send('MATCHING')
        end)
        sv:on("receive", receiver)
        tmr.stop(1)
    end
end)
