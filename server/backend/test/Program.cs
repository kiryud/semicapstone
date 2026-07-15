using System.Data;
using MySqlConnector;
using Dapper;

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

string connectionString = "Server=localhost;Port=3306;Database=semicapstone;User Id=jijeong;Password=4321;";

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



app.MapGet("/api/dashboard", async (string? device_id) => {

    string targetDevice = device_id ?? "chamber_1";

    using IDbConnection db = new MySqlConnection(connectionString);

    string query = @"
        SELECT 
            device_id, sequence, state, co2, temperature, humidity, 
            pm1_0, pm2_5, pm10, voc, fan_speed, fan_voltage, 
            fan_current_mA, fan_power_W, measured_at, received_at
        FROM sensor_readings
        ORDER BY id DESC
        LIMIT 1";

    var reading = await db.QueryFirstOrDefaultAsync<SensorReading>(query);

    if (reading == null)
    {
        return Results.NotFound(new { message = $"장치({targetDevice})의 최신 데이터를 찾을 수 없습니다." });
    }

    var responseValues = new
    {
        device_id = reading.device_id,
        sequence = reading.sequence,
        state = reading.state,
        co2 = reading.co2,
        temperature = reading.temperature,
        humidity = reading.humidity,
        pm1_0 = reading.pm1_0,
        pm2_5 = reading.pm2_5,
        pm10 = reading.pm10,
        voc = reading.voc,
        fan_speed = reading.fan_speed,
        fan_voltage = reading.fan_voltage,
        fan_current_mA = reading.fan_current_mA,
        fan_power_W = reading.fan_power_W,
        measured_at = reading.measured_at.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
        received_at = reading.received_at.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    };

    return Results.Ok(responseValues);
});

app.MapGet("/api/dashboard/history", async (string? device_id, string? range) => {

    string targetDevice = device_id ?? "chamber_1";
    string targetRange = range ?? "1m";

    int seconds = targetRange switch
    {
        "1m" => 60,
        "10m" => 600,
        "1h" => 3600,
        _ => 60
    };

    using IDbConnection db = new MySqlConnection(connectionString);

    string query = @"
        SELECT
            device_id,
            sequence,
            state,
            co2,
            pm2_5,
            fan_speed,
            measured_at,
            received_at
        FROM sensor_readings
        WHERE device_id = @device_id
          AND measured_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL @seconds SECOND)
        ORDER BY measured_at ASC";

    var data = await db.QueryAsync<HistoryReading>(
        query,
        new
        {
            device_id = targetDevice,
            seconds
        });
    return Results.Ok(new
    {
        device_id = targetDevice,
        range = targetRange,
        total_points = data.Count(),
        resolution_seconds = 1,
        data
    });
});


app.MapPost("/api/sensor", async (SensorReading reading) =>
{
    using IDbConnection db = new MySqlConnection(connectionString);

    string query = @"
        INSERT INTO sensor_readings
        (
            device_id,
            sequence,
            state,
            co2,
            temperature,
            humidity,
            pm1_0,
            pm2_5,
            pm10,
            voc,
            fan_speed,
            fan_voltage,
            fan_current_mA,
            fan_power_W,
            measured_at,
            received_at
        )
        VALUES
        (
            @device_id,
            @sequence,
            @state,
            @co2,
            @temperature,
            @humidity,
            @pm1_0,
            @pm2_5,
            @pm10,
            @voc,
            @fan_speed,
            @fan_voltage,
            @fan_current_mA,
            @fan_power_W,
            @measured_at,
            UTC_TIMESTAMP()
        )";

    await db.ExecuteAsync(query, reading);

    return Results.Ok();
});

app.Run();

public class LoginRequest
{
    public string Id { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class SensorReading
{
    public string device_id { get; set; } = string.Empty;
    public int sequence { get; set; }
    public string state { get; set; } = "NORMAL";
    public int co2 { get; set; }
    public double temperature { get; set; }
    public double humidity { get; set; }
    public int pm1_0 { get; set; }
    public int pm2_5 { get; set; }
    public int pm10 { get; set; }
    public int voc { get; set; }
    public int fan_speed { get; set; }
    public double fan_voltage { get; set; }
    public double fan_current_mA { get; set; }
    public double fan_power_W { get; set; }
    public DateTime measured_at { get; set; }
    public DateTime received_at { get; set; }
}

public class HistoryReading
{
    public string device_id { get; set; } = string.Empty;
    public int sequence { get; set; }
    public string state { get; set; } = "NORMAL";

    public int co2 { get; set; }
    public int pm2_5 { get; set; }
    public int fan_speed { get; set; }

    public DateTime measured_at { get; set; }
    public DateTime received_at { get; set; }
}
