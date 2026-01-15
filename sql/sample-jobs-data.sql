-- Sample Jobs Data with Varied Education Levels and Skills
-- This adds realistic job postings with different requirements

-- Customer Service Representative (High School)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  58, -- Public Employment Service Office (PESO)
  'Customer Service Representative',
  'Handle customer inquiries, resolve complaints, and provide product information via phone, email, and chat. Process orders and maintain customer records.',
  'Parañaque City',
  'High School Graduate',
  'Male/Female',
  'None Required',
  '₱18,000 - ₱25,000',
  10,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Communication', 'Customer Service', 'Problem Solving', 'Typing', 'Computer Literacy']
);

-- Data Entry Clerk (High School)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  52, -- City Human Resource Management Office (CHRMO)
  'Data Entry Clerk',
  'Input and update data in computer systems, verify accuracy of information, and maintain organized digital records. Fast and accurate typing required.',
  'Parañaque City',
  'High School Graduate',
  'Male/Female',
  'None Required',
  '₱16,000 - ₱22,000',
  5,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Typing', 'Attention to Detail', 'Microsoft Excel', 'Computer Literacy', 'Data Entry']
);

-- Warehouse Associate (High School)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  1, -- Tech Innovations Inc.
  'Warehouse Associate',
  'Load and unload shipments, organize inventory, operate forklifts, and maintain warehouse cleanliness. Physical work required.',
  'Parañaque City',
  'High School Graduate',
  'Male',
  'None Required',
  '₱17,000 - ₱23,000',
  8,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Physical Fitness', 'Inventory Management', 'Teamwork', 'Forklift Operation', 'Organization']
);

-- Sales Associate (High School/Vocational)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  2, -- Creative Studio
  'Retail Sales Associate',
  'Assist customers with product selection, process transactions, maintain store displays, and achieve sales targets. Friendly personality required.',
  'Makati City',
  'High School Graduate or Vocational',
  'Male/Female',
  'None Required',
  '₱18,000 - ₱28,000',
  15,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '45 days',
  ARRAY['Sales', 'Communication', 'Customer Service', 'Product Knowledge', 'Cash Handling']
);

-- Administrative Assistant (Vocational/Associate Degree)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  51, -- City Mayor's Office - Parañaque
  'Administrative Assistant',
  'Provide administrative support including scheduling, correspondence, filing, and office management. Proficiency in Microsoft Office required.',
  'Makati City',
  'Vocational or Associate Degree',
  'Male/Female',
  'None Required',
  '₱20,000 - ₱28,000',
  3,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Microsoft Office', 'Organization', 'Communication', 'Time Management', 'Filing']
);

-- Graphic Designer (Vocational/Bachelor's)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  2, -- Creative Studio
  'Junior Graphic Designer',
  'Create visual content for social media, marketing materials, and websites. Portfolio required during interview.',
  'Taguig City',
  'Vocational or Bachelor''s Degree in Design',
  'Male/Female',
  'None Required',
  '₱22,000 - ₱35,000',
  2,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Adobe Photoshop', 'Adobe Illustrator', 'Creativity', 'Typography', 'Layout Design']
);

-- Bookkeeper (Associate Degree preferred)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  56, -- City Treasurer's Office
  'Bookkeeper',
  'Maintain financial records, process invoices, reconcile accounts, and prepare financial reports. Knowledge of accounting software required.',
  'Taguig City',
  'Associate Degree in Accounting or related field',
  'Male/Female',
  'None Required',
  '₱25,000 - ₱35,000',
  2,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Bookkeeping', 'QuickBooks', 'Microsoft Excel', 'Attention to Detail', 'Accounting']
);

-- Social Media Coordinator (Bachelor's preferred but not required)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  58, -- Public Employment Service Office (PESO)
  'Social Media Coordinator',
  'Manage social media accounts, create engaging content, monitor analytics, and engage with followers. Experience with social platforms required.',
  'Quezon City',
  'College Level or Bachelor''s Degree',
  'Male/Female',
  'None Required',
  '₱22,000 - ₱32,000',
  3,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '45 days',
  ARRAY['Social Media', 'Content Creation', 'Copywriting', 'Analytics', 'Communication']
);

-- IT Support Technician (Vocational/Some College)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  1, -- Tech Innovations Inc.
  'IT Support Technician',
  'Provide technical support to users, troubleshoot hardware and software issues, install and configure computer systems.',
  'Quezon City',
  'Vocational Course or Some College (IT related)',
  'Male/Female',
  'None Required',
  '₱20,000 - ₱30,000',
  4,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Technical Support', 'Troubleshooting', 'Computer Hardware', 'Windows OS', 'Networking']
);

-- Cook/Kitchen Staff (Vocational preferred)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  51, -- City Mayor's Office - Parañaque
  'Line Cook',
  'Prepare menu items according to recipes, maintain kitchen cleanliness, and follow food safety standards. Culinary training preferred.',
  'Parañaque City',
  'High School Graduate or Vocational (Culinary)',
  'Male/Female',
  'Food Handler''s Certificate (preferred)',
  '₱19,000 - ₱26,000',
  6,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '20 days',
  ARRAY['Cooking', 'Food Safety', 'Knife Skills', 'Time Management', 'Teamwork']
);

-- Delivery Driver (High School)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  53, -- City Health Office
  'Delivery Driver',
  'Safely transport goods to customers, maintain delivery logs, and provide excellent customer service. Valid driver''s license required.',
  'Metro Manila',
  'High School Graduate',
  'Male',
  'Valid Professional Driver''s License',
  '₱18,000 - ₱25,000',
  10,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Driving', 'Navigation', 'Customer Service', 'Time Management', 'Safety Awareness']
);

-- Personal Care Assistant (Vocational/TESDA)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  55, -- City Social Welfare and Development Office (CSWDO)
  'Personal Care Assistant',
  'Provide assistance with daily living activities for elderly or disabled clients. Caregiving certification preferred.',
  'Parañaque City',
  'High School Graduate with TESDA Caregiving NC II',
  'Male/Female',
  'TESDA Caregiving NC II Certificate',
  '₱17,000 - ₱24,000',
  8,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Caregiving', 'Patient Care', 'First Aid', 'Communication', 'Empathy']
);

-- Marketing Assistant (Some College/Bachelor's)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  58, -- Public Employment Service Office (PESO)
  'Marketing Assistant',
  'Support marketing campaigns, conduct market research, coordinate events, and assist with promotional materials.',
  'Makati City',
  'College Level or Bachelor''s Degree in Marketing',
  'Male/Female',
  'None Required',
  '₱21,000 - ₱30,000',
  2,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Marketing', 'Research', 'Communication', 'Event Planning', 'Social Media']
);

-- Receptionist (High School/Vocational)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  52, -- City Human Resource Management Office (CHRMO)
  'Receptionist',
  'Greet visitors, answer phones, schedule appointments, and perform general office duties. Professional appearance required.',
  'Taguig City',
  'High School Graduate or Vocational',
  'Female',
  'None Required',
  '₱17,000 - ₱23,000',
  2,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Communication', 'Customer Service', 'Phone Etiquette', 'Organization', 'Microsoft Office']
);

-- Web Developer (Some College/Bachelor's)
INSERT INTO jobs (
  company_id,
  title,
  description,
  place_of_assignment,
  education,
  sex,
  eligibility,
  salary,
  manpower_needed,
  posted_date,
  deadline,
  skills
) VALUES (
  1, -- Tech Innovations Inc.
  'Junior Web Developer',
  'Develop and maintain websites, implement designs, and troubleshoot technical issues. Portfolio of projects required.',
  'Taguig City',
  'College Level or Bachelor''s in Computer Science/IT',
  'Male/Female',
  'None Required',
  '₱25,000 - ₱40,000',
  3,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '45 days',
  ARRAY['HTML', 'CSS', 'JavaScript', 'Web Development', 'Problem Solving']
);

-- NOTE: Jobs are distributed across various companies
-- Company distribution:
-- - Tech Innovations Inc. (1): Warehouse Associate, IT Support, Web Developer
-- - Creative Studio (2): Retail Sales, Graphic Designer
-- - City Mayor's Office (51): Admin Assistant, Line Cook
-- - CHRMO (52): Data Entry, Receptionist
-- - City Health Office (53): Delivery Driver
-- - City Treasurer's Office (56): Bookkeeper
-- - CSWDO (55): Personal Care Assistant
-- - PESO (58): Customer Service, Social Media, Marketing Assistant

-- To check what was inserted:
-- SELECT title, education, skills FROM jobs ORDER BY posted_date DESC LIMIT 15;
