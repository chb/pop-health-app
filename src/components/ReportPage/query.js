export default `CREATE TEMP TABLE T50XYFWT0MQ000 as
  select	a11.MRN  mrnchar
  from	CONS_CURRENT_PATIENT_DIM	a11
    left outer join	CONS_ENCOUNTER_DIM	a12
      on 	(a11.PATIENT_KEY = a12.PATIENT_KEY)
    left outer join	CONS_INSURANCE_FACT	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_INSURANCE_PLAN_DIM	a14
      on 	(a13.PLAN_KEY = a14.PLAN_KEY)
  where	(a11.INSURANCE_PLAN_KEY in (2407)
  or (a14.PLAN_ID in (24501)
  and a12.LATEST_CSN_FLAG in ('Y')))
  group by	a11.MRN 

CREATE TEMP TABLE T1ZL5FW2SMQ001 as
  select	a11.DATE_OF_BIRTH  DATE_OF_BIRTH,
    a13.EVENT_END_DT_TM  EVENT_END_DT_TM,
    a11.MRN  mrnchar
  from	CONS_CURRENT_PATIENT_DIM	a11
    left outer join	CONS_ENCOUNTER_DIM	a12
      on 	(a11.PATIENT_KEY = a12.PATIENT_KEY)
    left outer join	CONS_RESULT_COMPLETE_EVENT_FACT	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a14
      on 	(a13.EVENT_CD_KEY = a14.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a15
      on 	(a13.RESULT_STATUS_KEY = a15.RESULT_STATUS_KEY)
  where	(a14.EVENT_CODE in (451571267, 15611499, 355834331, 2798193)
  and a15.RESULT_STATUS_CD in (25, 34, 35))
  group by	a11.DATE_OF_BIRTH,
    a13.EVENT_END_DT_TM,
    a11.MRN
  having	(a13.EVENT_END_DT_TM >=  max(a11.DATE_OF_BIRTH)+cast('11 years' as interval)
  and a13.EVENT_END_DT_TM <=  max(a11.DATE_OF_BIRTH)+cast('13 years' as interval)) 

CREATE TEMP TABLE ZZMQ02 as
  select	a11.DATE_OF_BIRTH  DATE_OF_BIRTH,
    a13.EVENT_END_DT_TM  EVENT_END_DT_TM,
    a11.MRN  mrnchar
  from	CONS_CURRENT_PATIENT_DIM	a11
    left outer join	CONS_ENCOUNTER_DIM	a12
      on 	(a11.PATIENT_KEY = a12.PATIENT_KEY)
    left outer join	CONS_RESULT_COMPLETE_EVENT_FACT	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a14
      on 	(a13.EVENT_CD_KEY = a14.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a15
      on 	(a13.RESULT_STATUS_KEY = a15.RESULT_STATUS_KEY)
  where	(a14.EVENT_CODE in (212159322)
  and a15.RESULT_STATUS_CD in (25, 34, 35))
  group by	a11.DATE_OF_BIRTH,
    a13.EVENT_END_DT_TM,
    a11.MRN
  having	(a13.EVENT_END_DT_TM >=  max(a11.DATE_OF_BIRTH)+cast('10 years' as interval)
  and a13.EVENT_END_DT_TM <=  max(a11.DATE_OF_BIRTH)+cast('13 years' as interval)) 

CREATE TEMP TABLE ZZMQ03 as
  select	a11.DATE_OF_BIRTH  DATE_OF_BIRTH,
    a13.EVENT_END_DT_TM  EVENT_END_DT_TM,
    a11.MRN  mrnchar
  from	CONS_CURRENT_PATIENT_DIM	a11
    left outer join	CONS_ENCOUNTER_DIM	a12
      on 	(a11.PATIENT_KEY = a12.PATIENT_KEY)
    left outer join	CONS_RESULT_COMPLETE_EVENT_FACT	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a14
      on 	(a13.EVENT_CD_KEY = a14.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a15
      on 	(a13.RESULT_STATUS_KEY = a15.RESULT_STATUS_KEY)
  where	(a14.EVENT_CODE in (15611380, 314790541)
  and a15.RESULT_STATUS_CD in (25, 34, 35))
  group by	a11.DATE_OF_BIRTH,
    a13.EVENT_END_DT_TM,
    a11.MRN
  having	(a13.EVENT_END_DT_TM >=  max(a11.DATE_OF_BIRTH)+cast('9 years' as interval)
  and a13.EVENT_END_DT_TM <=  max(a11.DATE_OF_BIRTH)+cast('13 years' as interval)) 

CREATE TEMP TABLE ZZMD04 as
  select	a11.DAY  DAY,
    min(a11.DAY)  WJXBFS1
  from	CONS_DATE_DIM	a11
    join	CONS_RESULT_COMPLETE_EVENT_FACT	a12
      on 	(a11.DAY_KEY = a12.EVENT_END_DATE_KEY)
    left outer join	CONS_ENCOUNTER_DIM	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_CURRENT_PATIENT_DIM	a14
      on 	(a13.PATIENT_KEY = a14.PATIENT_KEY)
    join	ZZMQ03	pa15
      on 	(a12.EVENT_END_DT_TM = pa15.EVENT_END_DT_TM and 
    a14.DATE_OF_BIRTH = pa15.DATE_OF_BIRTH and 
    a14.MRN = pa15.mrnchar)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a16
      on 	(a12.EVENT_CD_KEY = a16.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a17
      on 	(a12.RESULT_STATUS_KEY = a17.RESULT_STATUS_KEY)
  where	(a16.EVENT_CODE in (15611380, 314790541)
  and a17.RESULT_STATUS_CD in (25, 34, 35))
  group by	a11.DAY 

CREATE TEMP TABLE ZZMD05 as
  select	a14.MRN  mrnchar,
    min(a11.DAY)  WJXBFS1,
    count(distinct a11.DAY)  WJXBFS2
  from	CONS_DATE_DIM	a11
    join	CONS_RESULT_COMPLETE_EVENT_FACT	a12
      on 	(a11.DAY_KEY = a12.EVENT_END_DATE_KEY)
    left outer join	CONS_ENCOUNTER_DIM	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_CURRENT_PATIENT_DIM	a14
      on 	(a13.PATIENT_KEY = a14.PATIENT_KEY)
    join	ZZMQ03	pa15
      on 	(a12.EVENT_END_DT_TM = pa15.EVENT_END_DT_TM and 
    a14.DATE_OF_BIRTH = pa15.DATE_OF_BIRTH and 
    a14.MRN = pa15.mrnchar)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a16
      on 	(a12.EVENT_CD_KEY = a16.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a17
      on 	(a12.RESULT_STATUS_KEY = a17.RESULT_STATUS_KEY)
  where	(a16.EVENT_CODE in (15611380, 314790541)
  and a17.RESULT_STATUS_CD in (25, 34, 35))
  group by	a14.MRN 

CREATE TEMP TABLE ZZMQ06 as
  select	pa11.DAY  DAY,
    pa12.mrnchar  mrnchar
  from	ZZMD04	pa11
    cross join	ZZMD05	pa12
  where	(pa11.WJXBFS1 > pa12.WJXBFS1) 

CREATE TEMP TABLE ZZMD07 as
  select	a14.MRN  mrnchar,
    min(a11.DAY)  WJXBFS1
  from	CONS_DATE_DIM	a11
    join	CONS_RESULT_COMPLETE_EVENT_FACT	a12
      on 	(a11.DAY_KEY = a12.EVENT_END_DATE_KEY)
    left outer join	CONS_ENCOUNTER_DIM	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_CURRENT_PATIENT_DIM	a14
      on 	(a13.PATIENT_KEY = a14.PATIENT_KEY)
    join	ZZMQ06	pa15
      on 	(a11.DAY = pa15.DAY and 
    a14.MRN = pa15.mrnchar)
    join	ZZMQ03	pa16
      on 	(a12.EVENT_END_DT_TM = pa16.EVENT_END_DT_TM and 
    a14.DATE_OF_BIRTH = pa16.DATE_OF_BIRTH and 
    a14.MRN = pa16.mrnchar)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a17
      on 	(a12.EVENT_CD_KEY = a17.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a18
      on 	(a12.RESULT_STATUS_KEY = a18.RESULT_STATUS_KEY)
  where	(a17.EVENT_CODE in (15611380, 314790541)
  and a18.RESULT_STATUS_CD in (25, 34, 35))
  group by	a14.MRN 

CREATE TEMP TABLE ZZMQ08 as
  select	pa11.DAY  DAY,
    pa12.mrnchar  mrnchar
  from	ZZMD04	pa11
    cross join	ZZMD07	pa12
  where	(pa11.WJXBFS1 > pa12.WJXBFS1) 

CREATE TEMP TABLE ZZMD09 as
  select	a14.MRN  mrnchar,
    count(distinct a11.DAY)  WJXBFS1,
    max(a11.DAY)  WJXBFS2
  from	CONS_DATE_DIM	a11
    join	CONS_RESULT_COMPLETE_EVENT_FACT	a12
      on 	(a11.DAY_KEY = a12.EVENT_END_DATE_KEY)
    left outer join	CONS_ENCOUNTER_DIM	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_CURRENT_PATIENT_DIM	a14
      on 	(a13.PATIENT_KEY = a14.PATIENT_KEY)
    join	ZZMQ01	pa15
      on 	(a12.EVENT_END_DT_TM = pa15.EVENT_END_DT_TM and 
    a14.DATE_OF_BIRTH = pa15.DATE_OF_BIRTH and 
    a14.MRN = pa15.mrnchar)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a16
      on 	(a12.EVENT_CD_KEY = a16.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a17
      on 	(a12.RESULT_STATUS_KEY = a17.RESULT_STATUS_KEY)
  where	(a16.EVENT_CODE in (451571267, 15611499, 355834331, 2798193)
  and a17.RESULT_STATUS_CD in (25, 34, 35))
  group by	a14.MRN 

CREATE TEMP TABLE ZZMD0A as
  select	a11.LAST_NAME  LAST_NAME,
    a11.FIRST_NAME  FIRST_NAME,
    pa12.mrnchar  mrnchar,
    a14.PROVIDER_ID  PROVIDER_ID,
    max(a14.FIRST_NAME)  FIRST_NAME0,
    max(a14.MIDDLE_INITIAL)  MIDDLE_INITIAL,
    max(a14.LAST_NAME)  LAST_NAME0,
    max(a14.NAME_SUFFIX)  NAME_SUFFIX,
    max(a14.NPI)  NPI,
    max(case when a14.LAST_NAME is null or a14.LAST_NAME='NULL' then '' else a14.LAST_NAME end||case when a14.FIRST_NAME is null or a14.FIRST_NAME='NULL' then '' else ', '||a14.FIRST_NAME end        ||case when a14.MIDDLE_INITIAL is null then '' else ' ' end            ||Nvl(a14.MIDDLE_INITIAL,''))  CustCol_263,
    a11.DATE_OF_BIRTH  DATE_OF_BIRTH,
    a11.CURRENT_AGE  CURRENT_AGE,
    count(distinct pa12.mrnchar)  WJXBFS1
  from	CONS_CURRENT_PATIENT_DIM	a11
    join	ZZMQ00	pa12
      on 	(a11.MRN = pa12.mrnchar)
    left outer join	CONS_CURRENT_PATIENT_GENERAL_PCP_BRIDGE	a13
      on 	(a11.PATIENT_KEY = a13.PATIENT_KEY)
    left outer join	CONS_PROVIDER_DIM	a14
      on 	(a13.GENERAL_PCP_KEY = a14.PROVIDER_KEY)
  where	a11.DATE_OF_BIRTH between To_Date('01/01/2005', 'mm/dd/yyyy') and To_Date('12/31/2005', 'mm/dd/yyyy')
  group by	a11.LAST_NAME,
    a11.FIRST_NAME,
    pa12.mrnchar,
    a14.PROVIDER_ID,
    a11.DATE_OF_BIRTH,
    a11.CURRENT_AGE 

CREATE TEMP TABLE ZZMD0B as
  select	a14.MRN  mrnchar,
    count(distinct a11.DAY)  WJXBFS1,
    max(a11.DAY)  WJXBFS2
  from	CONS_DATE_DIM	a11
    join	CONS_RESULT_COMPLETE_EVENT_FACT	a12
      on 	(a11.DAY_KEY = a12.EVENT_END_DATE_KEY)
    left outer join	CONS_ENCOUNTER_DIM	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_CURRENT_PATIENT_DIM	a14
      on 	(a13.PATIENT_KEY = a14.PATIENT_KEY)
    join	ZZMQ02	pa15
      on 	(a12.EVENT_END_DT_TM = pa15.EVENT_END_DT_TM and 
    a14.DATE_OF_BIRTH = pa15.DATE_OF_BIRTH and 
    a14.MRN = pa15.mrnchar)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a16
      on 	(a12.EVENT_CD_KEY = a16.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a17
      on 	(a12.RESULT_STATUS_KEY = a17.RESULT_STATUS_KEY)
  where	(a16.EVENT_CODE in (212159322)
  and a17.RESULT_STATUS_CD in (25, 34, 35))
  group by	a14.MRN 

CREATE TEMP TABLE ZZMD0C as
  select	a14.MRN  mrnchar,
    min(a11.DAY)  WJXBFS1
  from	CONS_DATE_DIM	a11
    join	CONS_RESULT_COMPLETE_EVENT_FACT	a12
      on 	(a11.DAY_KEY = a12.EVENT_END_DATE_KEY)
    left outer join	CONS_ENCOUNTER_DIM	a13
      on 	(a12.ENCOUNTER_KEY = a13.ENCOUNTER_KEY)
    left outer join	CONS_CURRENT_PATIENT_DIM	a14
      on 	(a13.PATIENT_KEY = a14.PATIENT_KEY)
    join	ZZMQ08	pa15
      on 	(a11.DAY = pa15.DAY and 
    a14.MRN = pa15.mrnchar)
    join	ZZMQ03	pa16
      on 	(a12.EVENT_END_DT_TM = pa16.EVENT_END_DT_TM and 
    a14.DATE_OF_BIRTH = pa16.DATE_OF_BIRTH and 
    a14.MRN = pa16.mrnchar)
    left outer join	CONS_RESULT_EVENT_CODE_DIM	a17
      on 	(a12.EVENT_CD_KEY = a17.EVENT_CODE_KEY)
    left outer join	CONS_RESULT_STATUS_DIM	a18
      on 	(a12.RESULT_STATUS_KEY = a18.RESULT_STATUS_KEY)
  where	(a17.EVENT_CODE in (15611380, 314790541)
  and a18.RESULT_STATUS_CD in (25, 34, 35))
  group by	a14.MRN 

CREATE TEMP TABLE ZZMD0D as
  select	a13.MRN  mrnchar,
    max(a11.SUBSCRIBER_NUMBER)  WJXBFS1
  from	CONS_INSURANCE_FACT	a11
    left outer join	CONS_ENCOUNTER_DIM	a12
      on 	(a11.ENCOUNTER_KEY = a12.ENCOUNTER_KEY)
    left outer join	CONS_CURRENT_PATIENT_DIM	a13
      on 	(a12.PATIENT_KEY = a13.PATIENT_KEY)
    left outer join	CONS_INSURANCE_PLAN_DIM	a14
      on 	(a11.PLAN_KEY = a14.PLAN_KEY)
  where	a14.PLAN_ID in (24501)
  group by	a13.MRN 

CREATE TEMP TABLE ZZMD0E as
  select	a15.MRN  mrnchar,
    max((Case when (a11.DAY <=  To_Date('12/06/2018', 'mm/dd/yyyy') and a13.CLINIC_CODE in ('057', '085', '125', '128', '143', '285', '670', '700', '802', '858')) then a11.DAY else NULL end))  WJXBFS1,
    max((Case when a13.CLINIC_CODE in ('057', '125') then a11.DAY else NULL end))  WJXBFS2,
    max((Case when a13.CLINIC_CODE in ('143') then a11.DAY else NULL end))  WJXBFS3,
    max((Case when a13.CLINIC_CODE in ('085') then a11.DAY else NULL end))  WJXBFS4,
    max((Case when a13.CLINIC_CODE in ('128') then a11.DAY else NULL end))  WJXBFS5,
    max((Case when a13.CLINIC_CODE in ('285', '670', '700', '802', '858') then a11.DAY else NULL end))  WJXBFS6
  from	CONS_DATE_DIM	a11
    left outer join	CONS_APPOINTMENT_FACT	a12
      on 	(a11.DAY_KEY = a12.APPOINTMENT_DATE_KEY)
    left outer join	CONS_APPOINTMENT_DIM	a13
      on 	(a12.APPOINTMENT_KEY = a13.APPOINTMENT_KEY)
    left outer join	CONS_ENCOUNTER_DIM	a14
      on 	(a12.ENCOUNTER_KEY = a14.ENCOUNTER_KEY)
    left outer join	CONS_CURRENT_PATIENT_DIM	a15
      on 	(a14.PATIENT_KEY = a15.PATIENT_KEY)
  where	(a13.APPOINTMENT_STATUS in ('Completed', 'Arrived')
    and ((a11.DAY <=  To_Date('12/06/2018', 'mm/dd/yyyy')
    and a13.CLINIC_CODE in ('057', '085', '125', '128', '143', '285', '670', '700', '802', '858'))
    or a13.CLINIC_CODE in ('057', '125')
    or a13.CLINIC_CODE in ('143')
    or a13.CLINIC_CODE in ('085')
    or a13.CLINIC_CODE in ('128')
    or a13.CLINIC_CODE in ('285', '670', '700', '802', '858')))
  group by	a15.MRN 

select	pa11.mrnchar  mrnchar,
    pa11.DATE_OF_BIRTH  DATE_OF_BIRTH,
    pa11.CURRENT_AGE  CURRENT_AGE,
    pa11.LAST_NAME  LAST_NAME,
    pa11.FIRST_NAME  FIRST_NAME,
    pa11.PROVIDER_ID  PROVIDER_ID,
    pa11.FIRST_NAME0  FIRST_NAME0,
    pa11.MIDDLE_INITIAL  MIDDLE_INITIAL,
    pa11.LAST_NAME0  LAST_NAME0,
    pa11.NAME_SUFFIX  NAME_SUFFIX,
    pa11.NPI  NPI,
    pa11.CustCol_263  CustCol_263,
    pa12.WJXBFS1  WJXBFS1,
    pa11.WJXBFS1  WJXBFS2,
    pa13.WJXBFS1  WJXBFS3,
    pa14.WJXBFS2  WJXBFS4,
    pa12.WJXBFS2  WJXBFS5,
    pa13.WJXBFS2  WJXBFS6,
    pa14.WJXBFS1  WJXBFS7,
    pa15.WJXBFS1  WJXBFS8,
    pa16.WJXBFS1  WJXBFS9,
    pa17.WJXBFS1  WJXBFSa,
    pa18.WJXBFS1  WJXBFSb,
    CASE WHEN pa18.WJXBFS1 = pa18.WJXBFS2 THEN 'PCL' WHEN pa18.WJXBFS1 = pa18.WJXBFS3 THEN 'PCM' WHEN pa18.WJXBFS1 = pa18.WJXBFS4 THEN 'ADOL/L' WHEN pa18.WJXBFS1 = pa18.WJXBFS5 THEN 'ADOL/ME' WHEN pa18.WJXBFS1 = pa18.WJXBFS6 THEN 'ADOL/SAT' ELSE '' END  WJXBFSc,
    pa18.WJXBFS2  WJXBFSd,
    pa18.WJXBFS3  WJXBFSe,
    pa18.WJXBFS4  WJXBFSf,
    pa18.WJXBFS5  WJXBFS10,
    pa18.WJXBFS6  WJXBFS11
  from	ZZMD0A	pa11
    left outer join	ZZMD09	pa12
      on 	(pa11.mrnchar = pa12.mrnchar)
    left outer join	ZZMD0B	pa13
      on 	(pa11.mrnchar = pa13.mrnchar)
    left outer join	ZZMD05	pa14
      on 	(pa11.mrnchar = pa14.mrnchar)
    left outer join	ZZMD07	pa15
      on 	(pa11.mrnchar = pa15.mrnchar)
    left outer join	ZZMD0C	pa16
      on 	(pa11.mrnchar = pa16.mrnchar)
    left outer join	ZZMD0D	pa17
      on 	(pa11.mrnchar = pa17.mrnchar)
    left outer join	ZZMD0E	pa18
      on 	(pa11.mrnchar = pa18.mrnchar)
`;