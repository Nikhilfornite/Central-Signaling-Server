create table users(
  id UUID default gen_random_uuid() primary key,
  user_name varchar(50) unique,
  user_email varchar(50) unique,
  user_password varchar(100) unique
);

create table user_history(
  log_id UUID references users(id) on delete cascade,
  call_date DATE,
  call_time timestamptz,
  primary key (log_id,call_date,call_time)
);

create table rooms{
    roomid varchar(255) primary key
};