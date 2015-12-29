using Fleck;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace GameServer
{
    class Server
    {
        public static List<Ball> clients = new List<Ball>();
        public static List<Entity> entities = new List<Entity>();
        public static Ball b;

        static void Main(string[] args)
        {
            var server = new WebSocketServer("ws://127.0.0.1:2500");
            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    Log(socket.ConnectionInfo.ClientIpAddress + " connected");
                };
                socket.OnClose = () =>
                {
                    try
                    {
                        var ball = clients.Find(x => x.client == socket);
                        ball.Close();
                        clients.Remove(ball);
                    }
                    catch { }
                    Log(socket.ConnectionInfo.ClientIpAddress + " closed");
                };
                socket.OnMessage = (message) =>
                {
                    //decode
                    Resolve(message, socket);
                };
            });
            b = new Ball(null);
            b.r = 10;
            b.x = 500;
            b.y = 500;
            clients.Add(b);
            Console.ReadKey();
        }

        static void Log(string text)
        {
            Console.WriteLine(DateTime.Now.ToShortDateString() + " " + DateTime.Now.ToLongTimeString() + " " + text);
        }

        static void Resolve(string command, IWebSocketConnection client)
        {
            var data = command.Split();
            switch (data[0])
            {
                case "NEW":
                    try
                    {
                        var ball = new Ball(client);
                        if (ball.SetName(data[1]))
                        {
                            var rand = new Random();
                            do
                            {
                                ball.x = rand.Next(30, 2370);
                                ball.y = rand.Next(30, 1170);
                            } while (clients.Exists(x => x.Collision(ball)));
                            clients.Add(ball);
                            ball.SetPos(ball.x, ball.y, true);
                        }
                    }
                    catch { }
                    break;
                case "MOVE":
                    try
                    {
                        var ball = clients.Find(x => x.client == client);
                        var n = int.Parse(data[2]);
                        var nx = data[1] == "X" ? n : ball.x;
                        var ny = data[1] == "Y" ? n : ball.y;
                        ball.SetPos(nx, ny);
                    }
                    catch { }
                    break;
                case "CHAT":
                    try 
                    {
                        var ball = clients.Find(x => x.client == client);
                        var conv = Encoding.ASCII.GetString(Convert.FromBase64String(data[1]));
                        if (conv.Length < 1 || conv.Length > 50) return;
                        clients.ForEach(x => x.Send("CHAT " + data[1] + " " + ball.x + " " + ball.y + " " + ball.name));
                    }
                    catch { }
                    break;
                case "HIT":
                    try
                    {
                        var ball = clients.Find(x => x.client == client);
                        if (ball.Collision(b))
                        {
                            new Thread(() =>
                            {
                                var u = (Ball)ball.Clone();
                                var rand = new Random();
                                int force = rand.Next(300,500);
                                int x = 1;
                                for (int i = 0; i < force; i++)
                                {
                                    if (u.x > b.x)
                                        b.x -= x;
                                    else
                                        b.x += x;
                                    if (u.y > b.y)
                                        b.y -= x;
                                    else
                                        b.y += x;
                                    b.SetPos(b.x, b.y);
                                    Thread.Sleep(1);
                                }
                            }).Start();
                        }
                    }
                    catch { }
                    break;
            }
            Log(command);
        }
    }
}
