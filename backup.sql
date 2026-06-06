table_name
academic_years
announcements
assignment_submissions
assignments
attendance
classes
exams
fee_payments
fees_structure
leave_requests
marks
materials
message_thread_participants
message_threads
messages
profiles
section_teachers
sections
students
subjects
teacher_subjects
teacher_substitutions
teachers
timetable
table_name,column_name,data_type
academic_years,id,integer
academic_years,name,text
academic_years,start_date,date
academic_years,end_date,date
academic_years,is_current,boolean
announcements,id,integer
announcements,title,text
announcements,body,text
announcements,target,text
announcements,created_by,uuid
announcements,created_at,timestamp with time zone
assignment_submissions,id,integer
assignment_submissions,assignment_id,integer
assignment_submissions,student_id,integer
assignment_submissions,submitted_at,timestamp with time zone
assignment_submissions,file_url,text
assignment_submissions,grade,text
assignment_submissions,feedback,text
assignments,id,integer
assignments,title,text
assignments,description,text
assignments,subject_id,integer
assignments,section_id,integer
assignments,teacher_id,integer
assignments,due_date,timestamp with time zone
assignments,created_at,timestamp with time zone
attendance,id,bigint
attendance,student_id,bigint
attendance,timetable_id,bigint
attendance,date,date
attendance,status,text
attendance,remarks,text
attendance,updated_at,timestamp with time zone
classes,id,bigint
classes,name,text
classes,created_at,timestamp with time zone
exams,id,integer
exams,name,text
exams,subject_id,integer
exams,section_id,integer
exams,academic_year_id,integer
exams,exam_date,date
exams,max_marks,integer
exams,created_by,uuid
fee_payments,id,integer
fee_payments,student_id,integer
fee_payments,fees_structure_id,integer
fee_payments,amount_paid,numeric
fee_payments,payment_status,text
fee_payments,paid_at,timestamp with time zone
fee_payments,collected_by,uuid
fee_payments,remarks,text
fee_payments,student_name,text
fee_payments,roll_no,text
fee_payments,fee_structure_id,bigint
fee_payments,status,text
fee_payments,payment_method,text
fee_payments,updated_at,timestamp with time zone
fees_structure,id,integer
fees_structure,name,text
fees_structure,amount,numeric
fees_structure,academic_year_id,integer
fees_structure,applicable_to,text
fees_structure,due_date,date
leave_requests,id,integer
leave_requests,student_id,integer
leave_requests,from_date,date
leave_requests,to_date,date
leave_requests,reason,text
leave_requests,status,text
leave_requests,reviewed_by,uuid
leave_requests,reviewed_at,timestamp with time zone
leave_requests,created_at,timestamp with time zone
marks,id,integer
marks,exam_id,integer
marks,student_id,integer
marks,marks_obtained,numeric
marks,remarks,text
marks,entered_by,integer
marks,entered_at,timestamp with time zone
materials,id,integer
materials,title,text
materials,description,text
materials,file_url,text
materials,subject_id,integer
materials,section_id,integer
materials,uploaded_by,integer
materials,uploaded_at,timestamp with time zone
message_thread_participants,thread_id,integer
message_thread_participants,profile_id,uuid
message_threads,id,integer
message_threads,subject,text
message_threads,created_at,timestamp with time zone
messages,id,integer
messages,thread_id,integer
messages,sender_id,uuid
messages,body,text
messages,sent_at,timestamp with time zone
profiles,id,uuid
profiles,full_name,text