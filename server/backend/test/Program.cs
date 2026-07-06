using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowReact");

app.MapPost("/api/login", (LoginRequest request) =>
{
    if (request.Id == "admin" && request.Password == "admin")
    {
        return Results.Ok(new { message = "로그인 성공! 환영합니다.", token = "fake-jwt-token" });
    }

    return Results.BadRequest(new { message = "아이디 또는 비밀번호가 틀렸습니다." });
});

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


app.MapGet("/api/dashboard",
() => {
    return Results.Ok(new {
        chartFieldLabels = chartFieldLabels,
        chartFieldUnits = chartFieldUnits,
        chartValues = chartValues
        }
    );
});

app.MapGet("/api/test", () =>
{
    return Results.Ok(new {
        chartLabels = new[] { "1월", "2월", "3월", "4월", "5월", "6월" },
        chartValues = new[] { 450, 290, 520, 110, 340, 620 }
    });
});

app.Run();

public class LoginRequest
{
    public string Id { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}