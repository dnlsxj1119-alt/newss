-- AI 산업스터디 워크플로우를 위한 study_records 테이블 확장
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요. 모두 nullable 컬럼이라 기존 데이터/기능에 영향 없습니다.

alter table study_records
  add column if not exists source text default 'manual',
  add column if not exists article_title text,
  add column if not exists article_link text,
  add column if not exists press text,
  add column if not exists importance smallint,
  add column if not exists why_it_matters text,
  add column if not exists keywords text[],
  add column if not exists companies text[],
  add column if not exists technologies text[],
  add column if not exists trend_connection jsonb,
  add column if not exists my_opinion text,
  add column if not exists critical_thinking jsonb;

comment on column study_records.source is '기록 출처: manual(직접 작성) | ai_workflow(AI 산업스터디 워크플로우)';
comment on column study_records.trend_connection is 'Trend Connection 결과: { related_articles, related_technologies, related_companies, industry_flow, further_study }';
comment on column study_records.critical_thinking is 'Critical Thinking 결과: { counterpoints, blindspots, questions }';
