namespace ReactAbb.Server.Models
{
    public class Session
    {
        public int ID { get; set; }
        public int USER_ID { get; set; }
        public string TOKEN { get; set; }
        public DateTime LOGIN_TIME { get; set; }
        public DateTime? LOGOUT_TIME { get; set; }
        public bool IS_ACTIVE { get; set; }
    }
}
