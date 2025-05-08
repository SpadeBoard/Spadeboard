namespace Algorithms
{
    public static class Snowflake
    {
        // Twitter Snowflake: 41 bits timestamp, 10 bits machine (5 datacenter + 5 worker), 12 bits sequence
        private static readonly object _lock = new();

        private static readonly int nodeId = int.Parse(Environment.GetEnvironmentVariable("SNOWFLAKE_NODE_ID") ?? "0");
        private static readonly int workerId = int.Parse(Environment.GetEnvironmentVariable("SNOWFLAKE_WORKER_ID") ?? "0");

        private static long _lastTimestamp = -1L;
        private static int _sequence = 0;

        // Twitter's custom epoch: 2010-11-04 01:42:54 UTC
        // https://medium.com/data-science/api-design-of-x-twitter-home-timeline-da426f19edfe
        private static readonly long customEpoch = 1288834974657L;

        public static long NewId()
        {
            lock (_lock)
            {
                long timestamp = GetUnixEpochTimestamp();

                if (timestamp == _lastTimestamp)
                {
                    _sequence = (_sequence + 1) & 0xFFF; // 12 bits: 0-4095
                    if (_sequence == 0)
                    {
                        // Sequence overflow, wait for next millisecond
                        timestamp = WaitNextMillis(_lastTimestamp);
                    }
                }
                else
                {
                    _sequence = 0;
                }

                _lastTimestamp = timestamp;

                // Takes the timestamp (milliseconds since Twitter's epoch), and shifts it left by 22 bits, so it occupies the highest 41 bits of the ID.
                // Shifts the node ID left by 17 bits, so it sits below the timestamp.
                // Shifts the worker ID left by 12 bits, so it sits just below the node ID.
                // The sequence number takes up the lowest 12 bits, so it doesn't need shifting.
                long id =
                ((timestamp - customEpoch) << 22) | // 41 bits for timestamp
                ((long)nodeId << 17) |              // 5 bits for node ID
                ((long)workerId << 12) |            // 5 bits for worker ID
                (long)_sequence;                    // 12 bits for sequence

                return id;
            }
        }

        // https://dev.to/kkrypt0nn/generating-unique-ids-with-the-snowflake-algorithm-5889
        // https://stackoverflow.com/questions/9453101/how-do-i-get-epoch-time-in-c
        private static long GetUnixEpochTimestamp()
        {
            return (long)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds;
        }

        private static long WaitNextMillis(long lastTimestamp)
        {
            long timestamp = GetUnixEpochTimestamp();
            while (timestamp <= lastTimestamp)
            {
                timestamp = GetUnixEpochTimestamp();
            }
            return timestamp;
        }
    }
}
