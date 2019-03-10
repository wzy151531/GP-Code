t = require("tools")
DATA_START = 0xf5
DATA_END = 0xf5
function CmdGenCHK(arr)
    local i
    local temp = 0
    local wLen = table.getn(arr)
    for i = 1, wLen do
        temp = t.Xor(temp, tonumber(arr[i], 16))
    end
    print("temp=" .. temp)
    return temp
end
--uart.setup(0, 19200, 8, uart.PARITY_NONE, uart.STOPBITS_1, 0)
uart.write(0, DATA_START, 0x21, 0x00, 0x00, 5, 0x00, CmdGenCHK({"21", "00", "00", "5", "00"}), DATA_END)
--uart.setup(0, 115200, 8, uart.PARITY_NONE, uart.STOPBITS_1, 0)
uart.on("data", function(data)
    print("receive from uart:", data)
    if data == "quit" then
        uart.on("data")     --unregister callback function
    end
end, 0)