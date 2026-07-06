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

app.MapGet("/api/dashboard", () =>
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