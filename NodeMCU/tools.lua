--定义一个名为tools的m模块
tools = {}

function tobinary(num)
	local tmp = num
	local str = ""
	repeat
		if tmp % 2 == 1 then
			str = str.."1"
		else 
			str = str.."0"
		end
		tmp = math.floor(tmp/2)
	until(tmp == 0)
	str = string.reverse(str)
	return str
end
 
function makesamelength(num1,num2)
	local str1 = tobinary(num1)
	local str2 = tobinary(num2)
	local len1 = string.len(str1)
	local len2 = string.len(str2)
	local len = 0
	local x = 0
	if len1 > len2 then
		x = len1 - len2
		for i=1,x do
			str2 = "0"..str2
		end
		len = len1
	elseif len2 > len1 then
		x = len2 - len1
		for i=1,x do
			str1 = "0"..str1
		end
		len = len2
	end
	return str1,str2,len
end

function Xor(num1,num2)
	local str1 
	local str2 
	local len 
	local tmp = ""
	str1,str2,len = makesamelength(num1,num2)
	for i = 1, len do
		local s1 = string.sub(str1,i,i)
		local s2 = string.sub(str2,i,i)
		if s1 == s2 then
			tmp = tmp.."0"
		else
			tmp = tmp.."1"
		end
	end
	--tmp = string.reverse(tmp)
	return tonumber(tmp,2)
end

--定义以下公有函数供其它文件调用
--返回指定数组所有元素的异或值和
function tools.CmdGenCHK(arr)
    local i
    local temp = 0
    local wLen = table.getn(arr)
    for i = 1, wLen do
        temp = Xor(temp, tonumber(arr[i], 16))
    end
    --print("temp=" .. temp)
    return temp
end

--将二进制数据流转成16进制字符串
function tools.bin2hex(s)
    s=string.gsub(s,"(.)",function (x) return string.format("%02X ",string.byte(x)) end)
    return s
end

--将16进制字符串转成二进制数据流
function tools.hex2bin( hexstr )
    local s = string.gsub(hexstr, "(.)(.)%s", function ( h, l )
         return string.char(h2b[h]*16+h2b[l])
    end)
    return s
end

--字符串分割函数，返回字符串数组
function tools.split(str, reps)
	local resultStrList = {}
    string.gsub(str,'[^'..reps..']+',function ( w )
        table.insert(resultStrList,w)
    end)
    return resultStrList
end

tools.DATA_START = 0xf5
tools.DATA_END = 0xf5

return tools