```c#
var chartFieldLabels = new[]
{
    "device_id",
    "datetime",
    "state",
    "CO2",
    "temperature",
    "humidity",
    "pm1_0",
    "pm2_5",
    "pm10",
    "voc",
    "fan_speed",
    "fan_voltage",
    "fan_current_mA"
};

var chartFieldUnits = new
{
    device_id = "",
    datetime = "",
    state = "",
    CO2 = "ppm",
    temperature = "C",
    humidity = "%",
    pm1_0 = "ug/m3",
    pm2_5 = "ug/m3",
    pm10 = "ug/m3",
    voc = "level",
    fan_speed = "%",
    fan_voltage = "V",
    fan_current_mA = "mA",
};

var chartValues = new
{
    device_id = "null",
    datetime = "null",
    state = "NORMAL",
    data = new {
        CO2 = 709,
        temperature = 21.2,
        humidity = 60.5,
        pm1_0 = 27,
        pm2_5 = 27,
        pm10 = 28,
        voc = 0,
        fan_speed = 40,
        fan_voltage = 5.028,
        fan_current_mA = 41.6,
    },
};
```