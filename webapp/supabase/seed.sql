-- ============================================
-- SEED DATA — ALL 10 HERBS + CONDITIONS + MEDICATIONS + RISK MAPPINGS
-- ============================================

-- ============================
-- HERBS (10)
-- ============================

INSERT INTO herbs (id, botanical_name, family, names, parts_used, classification, ayurvedic_profile, dosage_ranges, side_effects, misuse_patterns, red_flags, source_monograph) VALUES

('herb_ashwagandha', 'Withania somnifera', 'Solanaceae',
 '{"sanskrit":"Ashwagandha","hindi":"Asgandh","english":"Indian Ginseng, Winter Cherry"}'::jsonb,
 ARRAY['root'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Balya","Brimhaniya"]}'::jsonb,
 '{"rasa":["tikta","kashaya","madhura"],"guna":["laghu","snigdha"],"virya":"ushna","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"may_aggravate","strength":"mild"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm milk, ghee, or honey"},{"form":"Standardized extract (2.5-5% withanolides)","range_min":"300mg","range_max":"600mg","unit":"per day","notes":"Most studied form"},{"form":"KSM-66","range_min":"300mg","range_max":"600mg","unit":"per day","notes":"Full-spectrum root extract"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI discomfort","Drowsiness/sedation"],"uncommon":["Headache","Skin rash","Vivid dreams"],"rare":["Hepatotoxicity (case reports 2020-2024)","Thyroid overstimulation"]}'::jsonb,
 '[]'::jsonb,
 '[{"symptom":"Yellowing skin/eyes, dark urine","severity":"urgent","action":"Stop immediately. Liver function test.","rationale":"DILI case reports"},{"symptom":"Rapid heart rate, tremors, weight loss","severity":"urgent","action":"Stop. Check thyroid.","rationale":"Thyroid overstimulation"}]'::jsonb,
 'herbs/ashwagandha.md'),

('herb_triphala', 'Terminalia chebula + Terminalia bellirica + Phyllanthus emblica', 'Combretaceae + Phyllanthaceae',
 '{"sanskrit":"Triphala","hindi":"Triphala","english":"Three Fruits"}'::jsonb,
 ARRAY['dried fruit pulp'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Tridoshahara"]}'::jsonb,
 '{"rasa":["all_five"],"guna":["laghu","ruksha"],"virya":"mixed","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Churna","range_min":"3g","range_max":"6g","unit":"per day","notes":"Mixed in warm water"},{"form":"Tablet","range_min":"500mg","range_max":"1000mg","unit":"1-2 times daily","notes":"Standardized commercial form"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Loose stools","Mild abdominal cramping","Flatulence"],"uncommon":["Dehydration signs","Fatigue","Reduced appetite"],"rare":["Electrolyte depletion","Rectal irritation"]}'::jsonb,
 '[{"pattern_id":"trip_misuse_01","title":"Daily laxative dependency","description":"Using 5-10g nightly indefinitely as sole bowel regulator","why_harmful":"Creates dependency cycle. Masks underlying pathology.","prevalence":"very_common"}]'::jsonb,
 '[{"symptom":"Persistent diarrhea >3 days","severity":"urgent","action":"Stop. Rehydrate. Seek care.","rationale":"Fluid/electrolyte loss"},{"symptom":"Blood in stool","severity":"emergency","action":"Stop immediately. Medical evaluation.","rationale":"Never normal"}]'::jsonb,
 'herbs/triphala.md'),

('herb_tulsi', 'Ocimum tenuiflorum', 'Lamiaceae',
 '{"sanskrit":"Tulasi","hindi":"Tulsi","english":"Holy Basil, Sacred Basil"}'::jsonb,
 ARRAY['leaves','seeds','essential oil'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Shwasahara","Krimighna"]}'::jsonb,
 '{"rasa":["katu","tikta"],"guna":["laghu","ruksha","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"mixed","strength":"moderate"},"pitta":{"effect":"aggravates","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Fresh leaves","range_min":"5","range_max":"10","unit":"leaves per day","notes":"Traditional home consumption"},{"form":"Dried leaf tea","range_min":"2g","range_max":"5g","unit":"per cup, 1-2 cups daily","notes":"Steep 5-10 minutes"},{"form":"Standardized extract","range_min":"300mg","range_max":"600mg","unit":"per day","notes":"2.5% ursolic acid typical"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI irritation","Increased body heat","Mild blood sugar lowering"],"uncommon":["Headache","Skin dryness","Increased bleeding tendency"],"rare":["Allergic reaction","Fertility effects (animal data only)"]}'::jsonb,
 '[{"pattern_id":"tulsi_misuse_01","title":"Immunity booster oversimplification","description":"Marketed as first-line immune defence without clinical evidence","why_harmful":"No RCT shows reduced infection rates. Immunomodulatory ≠ immune boosting.","prevalence":"very_common"}]'::jsonb,
 '[{"symptom":"Persistent hypoglycemia","severity":"urgent","action":"Stop Tulsi. Check glucose. Inform physician.","rationale":"Blood sugar interaction"}]'::jsonb,
 'herbs/tulsi.md'),

('herb_brahmi', 'Bacopa monnieri', 'Plantaginaceae',
 '{"sanskrit":"Brahmi","hindi":"Brahmi","english":"Water Hyssop, Indian Pennywort"}'::jsonb,
 ARRAY['whole aerial herb'],
 '{"rasayana":true,"medhya":true,"hridya":false,"classical_groups":["Medhya Rasayana"]}'::jsonb,
 '{"rasa":["tikta","kashaya","madhura"],"guna":["laghu","sara"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"may_aggravate","strength":"mild"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Raw powder","range_min":"2g","range_max":"5g","unit":"per day","notes":"Bitter. Take with ghee or milk."},{"form":"Standardized extract (40-55% bacosides)","range_min":"150mg","range_max":"300mg","unit":"per day","notes":"Most clinical trials use this range"},{"form":"Standardized extract (20-25% bacosides)","range_min":"300mg","range_max":"450mg","unit":"per day","notes":"Lower concentration, higher dose needed"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI discomfort, nausea (saponin effect)","Drowsiness"],"uncommon":["Headache","Increased appetite","Dry mouth"],"rare":["Allergic reaction","Thyroid changes (animal data)"]}'::jsonb,
 '[{"pattern_id":"brahmi_misuse_01","title":"Exam-time megadosing","description":"2-3x doses 2 weeks before exams","why_harmful":"Effects need 6-12 weeks. Overdosing causes sedation and nausea — opposite of desired.","prevalence":"common"}]'::jsonb,
 '[{"symptom":"Persistent GI distress >5 days","severity":"urgent","action":"Stop. Reduce dose. Seek care if persists.","rationale":"Saponin GI irritation"}]'::jsonb,
 'herbs/brahmi.md'),

('herb_shatavari', 'Asparagus racemosus', 'Asparagaceae',
 '{"sanskrit":"Shatavari","hindi":"Satavar","english":"Wild Asparagus"}'::jsonb,
 ARRAY['tuberous root'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Balya","Vayahsthapana","Shukra Janana"]}'::jsonb,
 '{"rasa":["madhura","tikta"],"guna":["guru","snigdha"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"aggravates","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm milk and ghee"},{"form":"Standardized extract","range_min":"500mg","range_max":"1000mg","unit":"per day","notes":"Variable standardization"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Weight gain","Increased mucus","Reduced appetite"],"uncommon":["Mild diarrhea","Breast tenderness"],"rare":["Allergic reaction","Fluid retention"]}'::jsonb,
 '[{"pattern_id":"shat_misuse_01","title":"PCOS self-medication","description":"Using Shatavari for PCOS based on hormone balancing claims","why_harmful":"No clinical trial supports Shatavari for PCOS. Zero evidence.","prevalence":"common"}]'::jsonb,
 '[]'::jsonb,
 'herbs/shatavari.md'),

('herb_guduchi', 'Tinospora cordifolia', 'Menispermaceae',
 '{"sanskrit":"Guduchi","hindi":"Giloy","english":"Heart-leaved Moonseed"}'::jsonb,
 ARRAY['stem','leaves'],
 '{"rasayana":true,"medhya":true,"hridya":false,"classical_groups":["Medhya","Deepaniya","Daha Prashamana"]}'::jsonb,
 '{"rasa":["tikta","kashaya"],"guna":["laghu","snigdha"],"virya":"ushna","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Stem powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"Bitter taste"},{"form":"Guduchi Satva","range_min":"500mg","range_max":"1g","unit":"per day","notes":"Aqueous starch extract. Milder."},{"form":"Giloy Ghan Vati","range_min":"1","range_max":"2","unit":"tablets twice daily","notes":"Concentrated extract"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Bitter taste/nausea","Mild constipation","Blood sugar reduction"],"uncommon":["GI discomfort","Headache"],"rare":["HEPATOTOXICITY — Multiple case reports 2020-2023 (AIIMS, PGI, KEM)","Hypoglycemia"]}'::jsonb,
 '[{"pattern_id":"gud_misuse_01","title":"COVID-era megadosing","description":"Massive Giloy consumption surge 2020-2022 for COVID immunity","why_harmful":"No evidence for COVID prevention. Led to hepatotoxicity case reports.","prevalence":"very_common"}]'::jsonb,
 '[{"symptom":"Yellowing skin/eyes, dark urine, abdominal pain","severity":"emergency","action":"STOP immediately. Urgent liver function testing.","rationale":"Hepatotoxicity case reports — most critical safety concern for Guduchi"}]'::jsonb,
 'herbs/guduchi.md'),

('herb_haridra', 'Curcuma longa', 'Zingiberaceae',
 '{"sanskrit":"Haridra","hindi":"Haldi","english":"Turmeric"}'::jsonb,
 ARRAY['rhizome'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Kusthaghna","Lekhaniya","Vishaghna"]}'::jsonb,
 '{"rasa":["tikta","katu"],"guna":["ruksha","laghu"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"mixed","strength":"moderate"},"pitta":{"effect":"mixed","strength":"mild"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Culinary powder","range_min":"2g","range_max":"5g","unit":"per day","notes":"Standard Indian cooking. Safest form."},{"form":"Curcumin extract (95%)","range_min":"500mg","range_max":"1500mg","unit":"per day","notes":"Most clinical trials. With or without bioavailability enhancers."},{"form":"Golden milk","range_min":"1","range_max":"2","unit":"tsp in warm milk","notes":"Traditional. Modest curcumin exposure."}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI discomfort at >1000mg curcumin","Yellow staining","Increased body heat"],"uncommon":["Headache","Skin rash","Increased bleeding tendency"],"rare":["Hepatotoxicity (case reports with high-dose supplements)","Kidney stone formation","Gallbladder attack in gallstone patients"]}'::jsonb,
 '[{"pattern_id":"har_misuse_01","title":"Piperine ignorance","description":"Taking curcumin+BioPerine without knowing piperine inhibits CYP3A4, CYP2D6, CYP1A2","why_harmful":"Enhances ALL co-administered drugs, not just curcumin. Undisclosed polypharmacy.","prevalence":"very_common"}]'::jsonb,
 '[{"symptom":"Unusual bleeding/bruising on anticoagulants","severity":"urgent","action":"Stop supplements. Check INR.","rationale":"Antiplatelet effects"},{"symptom":"Gallbladder pain","severity":"urgent","action":"Curcumin may have triggered biliary colic.","rationale":"Bile stimulation in gallstone patients"}]'::jsonb,
 'herbs/haridra.md'),

('herb_arjuna', 'Terminalia arjuna', 'Combretaceae',
 '{"sanskrit":"Arjuna","hindi":"Arjun ki chaal","english":"Arjun tree"}'::jsonb,
 ARRAY['stem bark'],
 '{"rasayana":false,"medhya":false,"hridya":true,"classical_groups":["Hridya"]}'::jsonb,
 '{"rasa":["kashaya"],"guna":["laghu","ruksha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"may_aggravate","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Arjuna has direct cardiovascular effects. Do not self-prescribe for heart conditions.","forms":[{"form":"Bark powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"Ksheerapaka (milk decoction) is classical preparation"},{"form":"Standardized extract","range_min":"500mg","range_max":"1000mg","unit":"per day","notes":"Standardization varies"},{"form":"Arjunarishta","range_min":"15ml","range_max":"30ml","unit":"twice daily","notes":"Contains ~5-10% self-generated alcohol"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI discomfort","Headache","Constipation"],"uncommon":["Hypotension symptoms","Bradycardia"],"rare":["Excessive hypotension/syncope with cardiac drugs","GI bleeding"]}'::jsonb,
 '[{"pattern_id":"arj_misuse_01","title":"Self-prescribing for heart symptoms","description":"Taking Arjuna for chest pain instead of cardiac evaluation","why_harmful":"Delays diagnosis of acute coronary syndrome, arrhythmia, valvular disease. Symptomatic relief ≠ treatment.","prevalence":"common"}]'::jsonb,
 '[{"symptom":"Chest pain, breathlessness, palpitations","severity":"emergency","action":"CARDIAC EMERGENCY. Do not treat with Arjuna. Seek immediate medical evaluation.","rationale":"Life-threatening cardiac conditions"},{"symptom":"Dizziness, fainting, slow heart rate","severity":"urgent","action":"Stop Arjuna. Seek ECG evaluation.","rationale":"Excessive hypotension or bradycardia"}]'::jsonb,
 'herbs/arjuna.md'),

('herb_amalaki', 'Phyllanthus emblica', 'Phyllanthaceae',
 '{"sanskrit":"Amalaki","hindi":"Amla","english":"Indian Gooseberry"}'::jsonb,
 ARRAY['fruit'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Vayahsthapana","Jvarahara"]}'::jsonb,
 '{"rasa":["amla","madhura","kashaya","tikta","katu"],"guna":["laghu","ruksha","sheeta"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"mild"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Fresh fruit","range_min":"1","range_max":"2","unit":"fruits per day","notes":"Traditional consumption"},{"form":"Dried powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With honey and water"},{"form":"Amla juice","range_min":"20ml","range_max":"30ml","unit":"per day","notes":"Diluted with water"}],"long_term_safety_data":true}'::jsonb,
 '{"common":["Mild GI discomfort","Increased urination"],"uncommon":["Acid reflux aggravation","Diarrhea at high doses"],"rare":["Kidney stone exacerbation","Iron overload aggravation"]}'::jsonb,
 '[{"pattern_id":"ama_misuse_01","title":"Murabba as health food for diabetics","description":"Amla murabba (60-70% sugar) consumed as healthy by diabetics","why_harmful":"Sugar content negates any blood glucose benefit.","prevalence":"very_common"}]'::jsonb,
 '[]'::jsonb,
 'herbs/amalaki.md'),

('herb_yashtimadhu', 'Glycyrrhiza glabra', 'Fabaceae',
 '{"sanskrit":"Yashtimadhu","hindi":"Mulethi","english":"Licorice, Liquorice"}'::jsonb,
 ARRAY['root','stolon'],
 '{"rasayana":true,"medhya":true,"hridya":false,"classical_groups":["Sandhaniya","Kanthya","Jivaniya","Medhya Rasayana"]}'::jsonb,
 '{"rasa":["madhura"],"guna":["guru","snigdha"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"aggravates","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Yashtimadhu has well-documented dose-dependent toxicity. Do not exceed recommended ranges.","forms":[{"form":"Root powder","range_min":"3g","range_max":"5g","unit":"per day","notes":"Contains 2-14% glycyrrhizin. Content usually unknown to consumer."},{"form":"DGL (deglycyrrhizinated)","range_min":"380mg","range_max":"760mg","unit":"before meals","notes":"Safer alternative. No mineralocorticoid toxicity."},{"form":"Mulethi stick","range_min":"1","range_max":"2","unit":"small pieces per day","notes":"Low dose per chew"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Fluid retention/oedema","Headache","Blood pressure increase","Fatigue"],"uncommon":["Muscle weakness/cramps","Weight gain","Reduced libido (men)"],"rare":["Severe hypokalemia — muscle paralysis, respiratory compromise","Hypertensive crisis","Cardiac arrhythmia (Torsades de Pointes)","Rhabdomyolysis"]}'::jsonb,
 '[{"pattern_id":"yash_misuse_01","title":"Chronic mulethi chewing","description":"Heavy habitual chewing delivering significant glycyrrhizin","why_harmful":"Undisclosed cause of mystery hypertension. Multiple case reports.","prevalence":"common"},{"pattern_id":"yash_misuse_02","title":"Combined with diuretics","description":"Elderly on Furosemide/HCTZ consuming Mulethi in kadha","why_harmful":"Compounded potassium wasting. Hospitalisations documented.","prevalence":"moderate"}]'::jsonb,
 '[{"symptom":"Rising blood pressure, ankle/facial swelling","severity":"urgent","action":"Stop Mulethi. Check BP and electrolytes.","rationale":"Pseudohyperaldosteronism"},{"symptom":"Muscle weakness, palpitations, irregular heartbeat","severity":"emergency","action":"STOP. Urgent serum potassium. Possible hypokalemia-induced arrhythmia.","rationale":"Potentially fatal cardiac arrhythmia"}]'::jsonb,
 'herbs/yashtimadhu.md');


-- ============================
-- CONDITIONS (core set)
-- ============================

INSERT INTO conditions (id, condition_name, category, severity_level, escalation_required, escalation_reason, default_guidance) VALUES
('cond_pregnancy', 'Pregnancy', 'reproductive', 'high', false, null, 'During pregnancy, avoid all herbal supplements unless specifically advised by your obstetrician or qualified Ayurvedic practitioner.'),
('cond_lactation', 'Lactation', 'reproductive', 'moderate', false, null, 'During breastfeeding, use herbs cautiously and at low doses.'),
('cond_trying_to_conceive', 'Trying to Conceive', 'reproductive', 'moderate', false, null, 'Some herbs may affect fertility. Consult a practitioner if actively trying to conceive.'),
('cond_hypertension', 'Hypertension', 'cardiovascular', 'high', false, null, 'Herbs affecting blood pressure or fluid balance require monitoring.'),
('cond_heart_failure', 'Heart Failure', 'cardiovascular', 'high', false, null, 'Cardiac-active herbs and fluid-retaining herbs are high-risk.'),
('cond_coronary_artery_disease', 'Coronary Artery Disease', 'cardiovascular', 'high', false, null, 'Consult cardiologist before any herbal supplementation.'),
('cond_arrhythmia', 'Heart Arrhythmia', 'cardiovascular', 'high', false, null, 'Herbs affecting heart rate or potassium require cardiology supervision.'),
('cond_diabetes_type_2', 'Diabetes Type 2', 'metabolic', 'moderate', false, null, 'Multiple herbs lower blood sugar. Monitor glucose if on medication.'),
('cond_diabetes_type_1', 'Diabetes Type 1', 'metabolic', 'high', false, null, 'Blood sugar interactions with insulin are high-risk.'),
('cond_hypothyroid', 'Hypothyroidism', 'endocrine', 'moderate', false, null, 'Some herbs affect thyroid hormone levels. Monitor TSH.'),
('cond_hyperthyroid', 'Hyperthyroidism', 'endocrine', 'high', false, null, 'Thyroid-stimulating herbs must be avoided.'),
('cond_liver_disease', 'Liver Disease', 'hepatic', 'high', false, null, 'Given herb-related hepatotoxicity reports, liver disease patients require extreme caution.'),
('cond_kidney_disease_mild', 'Kidney Disease (Mild)', 'renal', 'moderate', false, null, 'Monitor electrolytes and fluid balance.'),
('cond_kidney_disease_moderate_severe', 'Kidney Disease (Moderate-Severe)', 'renal', 'high', false, null, 'Impaired clearance increases toxicity risk. Nephrologist required.'),
('cond_autoimmune', 'Autoimmune Disorder', 'immune', 'high', false, null, 'Immunomodulatory herbs may worsen autoimmune conditions.'),
('cond_bleeding_disorder', 'Bleeding Disorder', 'hematologic', 'high', false, null, 'Herbs with antiplatelet activity add bleeding risk.'),
('cond_peptic_ulcer', 'Peptic Ulcer (Active)', 'gastrointestinal', 'high', false, null, 'GI-irritating herbs (saponins, pungent herbs) may worsen ulcers.'),
('cond_gerd', 'GERD / Acid Reflux', 'gastrointestinal', 'moderate', false, null, 'Heating and pungent herbs may worsen reflux.'),
('cond_epilepsy', 'Epilepsy', 'neurological', 'high', false, null, 'Herbs affecting GABAergic/serotonergic systems may interact with antiepileptics.'),
('cond_obesity', 'Obesity', 'metabolic', 'low', false, null, 'Consider Kapha-reducing herbs. Avoid Kapha-aggravating herbs in excess.'),
('cond_underweight', 'Underweight / Emaciated', 'metabolic', 'moderate', false, null, 'Avoid Ruksha/Laghu/Lekhana herbs that further deplete.'),
('cond_breast_cancer_history', 'Breast Cancer (History)', 'oncology', 'high', false, null, 'Avoid all herbs with estrogenic activity. Inform oncologist.'),
('cond_organ_transplant', 'Organ Transplant', 'immune', 'high', false, null, 'Immunostimulatory herbs are contraindicated with immunosuppressants.'),
('cond_scheduled_surgery', 'Surgery Within 4 Weeks', 'surgical', 'moderate', false, null, 'Discontinue all herbal supplements 2 weeks before surgery.'),
('cond_ibs_diarrhea', 'IBS (Diarrhea-predominant)', 'gastrointestinal', 'moderate', false, null, 'Laxative herbs will worsen symptoms.'),
('cond_kidney_stones', 'Kidney Stones (History)', 'renal', 'moderate', false, null, 'Oxalate-containing herbs increase stone risk.'),
('cond_iron_overload', 'Iron Overload / Hemochromatosis', 'hematologic', 'moderate', false, null, 'Avoid herbs that enhance iron absorption.'),
-- Emergency conditions
('cond_chest_pain', 'Chest Pain (Active)', 'emergency', 'critical', true, 'Possible cardiac emergency. No herbal information should be provided.', 'STOP. Chest pain requires immediate medical evaluation.'),
('cond_blood_in_stool', 'Blood in Stool/Vomit', 'emergency', 'critical', true, 'Possible GI emergency.', 'STOP. Blood in stool or vomit requires immediate medical evaluation.'),
('cond_suicidal_thoughts', 'Suicidal Thoughts', 'emergency', 'critical', true, 'Mental health emergency.', 'Please contact a crisis helpline immediately. India: iCall 9152987821, Vandrevala Foundation 1860-2662-345.');


-- ============================
-- MEDICATIONS (core set)
-- ============================

INSERT INTO medications (id, medication_name, medication_class, common_brands_india, therapeutic_area, narrow_therapeutic_index, general_warning) VALUES
('med_digoxin', 'Digoxin', 'Cardiac glycoside', ARRAY['Lanoxin','Digox'], 'cardiology', true, 'Narrow therapeutic index. Any herbal affecting potassium or cardiac contractility must be disclosed.'),
('med_warfarin', 'Warfarin', 'Anticoagulant', ARRAY['Warf','Acitrom'], 'hematology', true, 'Narrow therapeutic index. INR monitoring essential with any herbal.'),
('med_beta_blocker', 'Beta-blocker', 'Antihypertensive', ARRAY['Metoprolol/Betaloc','Atenolol'], 'cardiology', false, 'Herbs affecting heart rate may cause additive bradycardia.'),
('med_ace_arb', 'ACE Inhibitor / ARB', 'Antihypertensive', ARRAY['Enalapril/Envas','Losartan/Losacar','Telmisartan/Telma'], 'cardiology', false, 'Herbs lowering BP may cause additive hypotension.'),
('med_ccb', 'Calcium Channel Blocker', 'Antihypertensive', ARRAY['Amlodipine/Amlong','Diltiazem'], 'cardiology', false, 'Additive vasodilation or heart rate effects.'),
('med_diuretic_loop', 'Loop Diuretic', 'Diuretic', ARRAY['Furosemide/Lasix'], 'cardiology', false, 'Potassium-wasting. Herbs causing additional K+ loss are high-risk.'),
('med_diuretic_thiazide', 'Thiazide Diuretic', 'Diuretic', ARRAY['Hydrochlorothiazide'], 'cardiology', false, 'Potassium-wasting. Same concern as loop diuretics.'),
('med_antidiabetic_oral', 'Oral Antidiabetic', 'Antidiabetic', ARRAY['Metformin/Glycomet','Glimepiride/Amaryl'], 'endocrinology', false, 'Herbs lowering blood sugar may cause additive hypoglycemia.'),
('med_insulin', 'Insulin', 'Antidiabetic', ARRAY['Various'], 'endocrinology', true, 'Hypoglycemia risk with blood-sugar-lowering herbs.'),
('med_ssri', 'SSRI', 'Antidepressant', ARRAY['Fluoxetine/Fludac','Sertraline/Daxid','Escitalopram/Nexito'], 'psychiatry', false, 'Herbs with serotonergic activity: theoretical serotonin syndrome risk.'),
('med_snri', 'SNRI', 'Antidepressant', ARRAY['Venlafaxine/Venlor','Duloxetine/Cymbalta'], 'psychiatry', false, 'Same serotonergic concern as SSRIs.'),
('med_benzodiazepine', 'Benzodiazepine', 'Anxiolytic/Sedative', ARRAY['Alprazolam/Alprax','Diazepam/Valium','Clonazepam/Rivotril'], 'psychiatry', false, 'Herbs with GABAergic activity cause additive sedation.'),
('med_antiepileptic', 'Antiepileptic', 'Anticonvulsant', ARRAY['Valproate/Depakote','Carbamazepine/Tegretol','Levetiracetam/Levipil'], 'neurology', true, 'Seizure management is life-critical. No uncontrolled herbal variables.'),
('med_levothyroxine', 'Levothyroxine', 'Thyroid hormone', ARRAY['Eltroxin','Thyronorm'], 'endocrinology', true, 'Herbs affecting thyroid function or absorption require monitoring.'),
('med_immunosuppressant', 'Immunosuppressant', 'Immunosuppressant', ARRAY['Cyclosporine','Tacrolimus/Prograf','Azathioprine/Imuran'], 'transplant/rheumatology', true, 'Immunostimulatory herbs directly oppose these drugs.'),
('med_corticosteroid_oral', 'Oral Corticosteroid', 'Corticosteroid', ARRAY['Prednisolone/Wysolone','Dexamethasone'], 'various', false, 'Herbs affecting cortisol metabolism amplify effects.'),
('med_aspirin_antiplatelet', 'Aspirin (Antiplatelet)', 'Antiplatelet', ARRAY['Ecosprin','Disprin'], 'cardiology', false, 'Herbs with antiplatelet activity increase bleeding risk.'),
('med_chemotherapy', 'Chemotherapy', 'Antineoplastic', ARRAY['Various'], 'oncology', true, 'Do NOT take herbal supplements during chemotherapy without oncologist approval.'),
('med_tamoxifen', 'Tamoxifen', 'Anti-estrogen', ARRAY['Nolvadex','Tamodex'], 'oncology', false, 'Any estrogenic herb may oppose Tamoxifen.'),
('med_iron_supplement', 'Iron Supplement', 'Hematologic', ARRAY['Various'], 'hematology', false, 'Tannin-rich herbs chelate iron. Separate by 2 hours.'),
('med_nsaid_regular', 'NSAID (Regular)', 'Anti-inflammatory', ARRAY['Ibuprofen/Brufen','Diclofenac/Voveran'], 'various', false, 'Additive GI irritation and antiplatelet effects.'),
('med_lithium', 'Lithium', 'Mood stabilizer', ARRAY['Licab','Lithosun'], 'psychiatry', true, 'Narrow therapeutic index. Herbs affecting renal clearance or fluid balance affect levels.');


-- ============================
-- HERB-CONDITION RISK MAPPINGS
-- ============================

-- Ashwagandha risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_ashwagandha', 'cond_pregnancy', 'red', 'Avoid Unless Supervised', 'Uterine stimulant properties. Animal teratogenicity data at high doses.', true),
('herb_ashwagandha', 'cond_hyperthyroid', 'red', 'Avoid Unless Supervised', 'May increase T3/T4 levels. Can worsen hyperthyroid conditions.', true),
('herb_ashwagandha', 'cond_autoimmune', 'yellow', 'Use With Caution', 'Immunomodulatory effects could theoretically stimulate overactive immune response.', false),
('herb_ashwagandha', 'cond_hypothyroid', 'yellow', 'Use With Caution', 'May potentiate thyroid medication. Monitor TSH.', false),
('herb_ashwagandha', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'May lower blood sugar. Hypoglycemia risk with antidiabetic drugs.', false),
('herb_ashwagandha', 'cond_liver_disease', 'yellow', 'Use With Caution', 'Rare DILI case reports. Monitor liver function.', false),
('herb_ashwagandha', 'cond_scheduled_surgery', 'yellow', 'Discontinue 2 weeks before', 'Effects on blood sugar, BP, immune modulation.', false);

-- Triphala risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_triphala', 'cond_pregnancy', 'red', 'Avoid Unless Supervised', 'Haritaki has uterine stimulant properties. Apana Vayu stimulation may promote contractions.', true),
('herb_triphala', 'cond_ibs_diarrhea', 'red', 'Avoid Unless Supervised', 'Laxative herb in diarrhea-predominant condition worsens fluid loss and electrolyte depletion.', true),
('herb_triphala', 'cond_underweight', 'yellow', 'Use With Caution', 'Laghu + Ruksha gunas further deplete. Laxative action reduces nutrient absorption.', false),
('herb_triphala', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood glucose lowering. Additive with antidiabetic drugs.', false),
('herb_triphala', 'cond_kidney_stones', 'yellow', 'Use With Caution', 'Oxalate content (especially Amalaki) may increase stone risk.', false),
('herb_triphala', 'cond_kidney_disease_moderate_severe', 'yellow', 'Use With Caution', 'Oxalate load + dehydration risk from laxative effect.', false);

-- Tulsi risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_tulsi', 'cond_pregnancy', 'red', 'Avoid Unless Supervised', 'Anti-implantation effects in animal models. Ursolic acid concerns.', true),
('herb_tulsi', 'cond_bleeding_disorder', 'red', 'Avoid Unless Supervised', 'Eugenol antiplatelet properties compound existing bleeding risk.', true),
('herb_tulsi', 'cond_trying_to_conceive', 'yellow', 'Use With Caution', 'Animal studies show reduced sperm count/motility at high doses. Human data absent.', false),
('herb_tulsi', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood glucose lowering (10-20%). Additive with antidiabetic drugs.', false),
('herb_tulsi', 'cond_hypothyroid', 'yellow', 'Use With Caution', 'Some animal data suggests reduced T3/T4 levels.', false),
('herb_tulsi', 'cond_autoimmune', 'yellow', 'Use With Caution', 'Immunomodulatory effects could worsen autoimmune dysregulation.', false),
('herb_tulsi', 'cond_scheduled_surgery', 'yellow', 'Discontinue 2 weeks before', 'Antiplatelet + blood sugar + BP effects.', false);

-- Brahmi risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_brahmi', 'cond_pregnancy', 'red', 'Avoid Unless Supervised', 'Insufficient safety data. Saponins may irritate uterine tissue.', true),
('herb_brahmi', 'cond_peptic_ulcer', 'red', 'Avoid Unless Supervised', 'Bacosides are saponins — mucosal irritants. Active ulcer + saponins = worsening risk.', true),
('herb_brahmi', 'cond_epilepsy', 'yellow', 'Caution — Neurologist Required', 'GABAergic anticonvulsant activity may interact with antiepileptic medications unpredictably.', false),
('herb_brahmi', 'cond_hypothyroid', 'yellow', 'Use With Caution', 'Animal data suggests may increase T4 levels.', false),
('herb_brahmi', 'cond_gerd', 'yellow', 'Use With Caution', 'Saponin content may worsen GI symptoms. Take with food.', false);

-- Shatavari risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_shatavari', 'cond_breast_cancer_history', 'red', 'Avoid Unless Supervised', 'Even weak estrogenic activity in estrogen-sensitive conditions adds risk.', true),
('herb_shatavari', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Classical Ayurveda considers it safe. Modern RCT safety data absent. Low-dose traditional preparations lower risk.', false),
('herb_shatavari', 'cond_obesity', 'yellow', 'Use With Caution', 'Guru + Snigdha + Sheeta = Kapha-aggravating. Weight gain risk.', false),
('herb_shatavari', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Animal data shows blood glucose reduction. Monitor.', false),
('herb_shatavari', 'cond_kidney_stones', 'yellow', 'Use With Caution', 'Asparagus species contain oxalates.', false);

-- Guduchi risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_guduchi', 'cond_pregnancy', 'red', 'Avoid Unless Supervised', 'Insufficient safety data. Immunostimulatory effects.', true),
('herb_guduchi', 'cond_liver_disease', 'red', 'Avoid Unless Supervised', 'Multiple hepatotoxicity case reports (2020-2023). Adding hepatic variable to compromised liver is high-risk.', true),
('herb_guduchi', 'cond_autoimmune', 'red', 'Avoid Unless Supervised', 'One of the strongest immunostimulatory herbs. Can worsen autoimmune conditions. May counteract immunosuppressants.', true),
('herb_guduchi', 'cond_organ_transplant', 'red', 'Avoid', 'Immunostimulation + hepatic risk + immunosuppressant interference = contraindicated.', true),
('herb_guduchi', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Berberine has independent glucose-lowering evidence. Additive hypoglycemia.', false);

-- Haridra/Turmeric risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_haridra', 'cond_bleeding_disorder', 'yellow', 'Use With Caution', 'Curcumin inhibits platelet aggregation. At supplement doses: increased bleeding risk.', false),
('herb_haridra', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Mild blood sugar lowering. Additive with antidiabetic drugs.', false),
('herb_haridra', 'cond_kidney_stones', 'yellow', 'Use With Caution', 'Turmeric contains oxalates (~2%). High-dose supplementation increases urinary oxalate.', false),
('herb_haridra', 'cond_iron_overload', 'yellow', 'Use With Caution', 'Vitamin C in Amla enhances iron absorption. Curcumin also chelates iron at high doses.', false),
('herb_haridra', 'cond_liver_disease', 'yellow', 'Use With Caution', 'Case reports with high-dose bioavailability-enhanced supplements.', false),
('herb_haridra', 'cond_scheduled_surgery', 'yellow', 'Discontinue supplements 2 weeks before', 'Anticoagulant + blood sugar effects.', false);

-- Arjuna risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_arjuna', 'cond_pregnancy', 'red', 'Avoid Unless Supervised', 'Cardiac-active herb. Not for pregnancy self-medication.', true),
('herb_arjuna', 'cond_heart_failure', 'red', 'Avoid Unless Supervised', 'Real cardiac effects. Unmonitored inotropic/hypotensive agent in active heart disease is high-risk. Cardiologist + Vaidya dual supervision required.', false),
('herb_arjuna', 'cond_arrhythmia', 'red', 'Avoid Unless Supervised', 'May affect cardiac rhythm. Anti-arrhythmic data is animal-only. Needs cardiologist.', false),
('herb_arjuna', 'cond_hypertension', 'yellow', 'Use With Caution', 'Vasodilatory and hypotensive effects. Additive with antihypertensives.', false);

-- Amalaki risks
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_amalaki', 'cond_pregnancy', 'green', 'Generally Safe', 'Dietary Amla safe. Long history of pregnancy use.', false),
('herb_amalaki', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood sugar lowering demonstrated. Additive with antidiabetic drugs. Murabba sugar content raises glucose.', false),
('herb_amalaki', 'cond_kidney_stones', 'yellow', 'Use With Caution', 'High Vitamin C + oxalate content at high doses.', false),
('herb_amalaki', 'cond_iron_overload', 'yellow', 'Use With Caution', 'Vitamin C dramatically enhances iron absorption.', false);

-- Yashtimadhu risks (the most dangerous)
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_yashtimadhu', 'cond_hypertension', 'red', 'Avoid Unless Supervised', 'Glycyrrhizin causes sodium/water retention → direct BP elevation. Crisis territory in pre-existing hypertension.', true),
('herb_yashtimadhu', 'cond_heart_failure', 'red', 'Avoid', 'Sodium/water retention worsens volume overload. Can precipitate acute decompensation.', true),
('herb_yashtimadhu', 'cond_kidney_disease_moderate_severe', 'red', 'Avoid Unless Supervised', 'Impaired renal function reduces glycyrrhizin clearance → accumulation → enhanced toxicity.', true),
('herb_yashtimadhu', 'cond_pregnancy', 'red', 'Avoid Unless Supervised', 'Finnish cohort: high maternal glycyrrhizin intake associated with adverse fetal outcomes. Glycyrrhizin crosses placenta.', true),
('herb_yashtimadhu', 'cond_liver_disease', 'yellow', 'Use With Caution', 'IV glycyrrhizin used for hepatitis in Japan. But oral licorice in cirrhosis worsens fluid retention (ascites).', false),
('herb_yashtimadhu', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Cortisol potentiation raises blood glucose. Opposes antidiabetic medication.', false),
('herb_yashtimadhu', 'cond_arrhythmia', 'red', 'Avoid Unless Supervised', 'Hypokalemia-induced arrhythmia risk. Torsades de Pointes documented.', true);


-- ============================
-- HERB-MEDICATION INTERACTIONS (critical ones)
-- ============================

-- Yashtimadhu (most dangerous interactions)
INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
('herb_yashtimadhu', 'med_digoxin', 'critical', 'proven', 'Glycyrrhizin-induced hypokalemia potentiates digoxin toxicity. Potentially fatal. Case reports exist.', 'AVOID. Do not combine under any circumstances without cardiologist.'),
('herb_yashtimadhu', 'med_diuretic_loop', 'high', 'proven', 'Both cause potassium wasting. Compounded hypokalemia risk. Multiple hospitalisation case reports.', 'AVOID combination. If unavoidable, monitor serum potassium weekly.'),
('herb_yashtimadhu', 'med_diuretic_thiazide', 'high', 'proven', 'Same potassium-wasting mechanism as loop diuretics.', 'AVOID combination.'),
('herb_yashtimadhu', 'med_corticosteroid_oral', 'high', 'pharmacological', 'Glycyrrhizin extends cortisol half-life via 11β-HSD2 inhibition. Amplifies all corticosteroid effects.', 'AVOID. Cushing-like syndrome risk.'),
('herb_yashtimadhu', 'med_ace_arb', 'moderate_high', 'pharmacological', 'Licorice directly raises BP, opposing antihypertensive therapy.', 'Inform physician. May cause treatment failure.'),
('herb_yashtimadhu', 'med_warfarin', 'low_moderate', 'theoretical', 'Some evidence of CYP interaction.', 'Monitor INR.'),
('herb_yashtimadhu', 'med_antidiabetic_oral', 'moderate', 'pharmacological', 'Cortisol potentiation raises blood glucose. Opposes antidiabetic medication.', 'Monitor glucose.'),
('herb_yashtimadhu', 'med_lithium', 'moderate', 'theoretical', 'Fluid/electrolyte changes may affect lithium clearance.', 'Monitor lithium levels.');

-- Arjuna (cardiac)
INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
('herb_arjuna', 'med_digoxin', 'high', 'pharmacological', 'Additive positive inotropic effect. Risk of digoxin-like toxicity.', 'Do not combine without cardiologist supervision.'),
('herb_arjuna', 'med_beta_blocker', 'high', 'pharmacological', 'Additive negative chronotropy + hypotension. Risk of symptomatic bradycardia.', 'Cardiologist must supervise.'),
('herb_arjuna', 'med_ace_arb', 'moderate_high', 'pharmacological', 'Additive hypotension. May cause symptomatic low BP.', 'Monitor BP. Inform physician.'),
('herb_arjuna', 'med_ccb', 'moderate_high', 'pharmacological', 'Additive vasodilation (Amlodipine) or heart rate reduction (Diltiazem/Verapamil).', 'Cardiologist must be informed.'),
('herb_arjuna', 'med_iron_supplement', 'moderate', 'pharmacological', 'High tannin content chelates iron. Reduces absorption.', 'Separate intake by 2+ hours.');

-- Ashwagandha
INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
('herb_ashwagandha', 'med_levothyroxine', 'moderate_high', 'theoretical', 'May increase T3/T4 levels. Potentiation risk.', 'Monitor thyroid function. Inform endocrinologist.'),
('herb_ashwagandha', 'med_benzodiazepine', 'moderate', 'theoretical', 'Additive sedation via GABAergic activity.', 'Monitor for excessive sedation.'),
('herb_ashwagandha', 'med_antidiabetic_oral', 'moderate', 'theoretical', 'Additive blood sugar lowering.', 'Monitor glucose.'),
('herb_ashwagandha', 'med_immunosuppressant', 'moderate_high', 'theoretical', 'May counteract immunosuppression.', 'Inform physician. Avoid without supervision.');

-- Brahmi
INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
('herb_brahmi', 'med_ssri', 'moderate', 'theoretical', 'Brahmi upregulates serotonin synthesis. Theoretical serotonin syndrome risk.', 'Inform psychiatrist before combining.'),
('herb_brahmi', 'med_snri', 'moderate', 'theoretical', 'Same serotonergic concern as SSRIs.', 'Inform psychiatrist.'),
('herb_brahmi', 'med_benzodiazepine', 'moderate', 'theoretical', 'Both enhance GABAergic transmission. Additive sedation.', 'Monitor for excessive drowsiness.'),
('herb_brahmi', 'med_antiepileptic', 'moderate_high', 'theoretical', 'GABAergic anticonvulsant activity may interfere with AED effects. Seizure management is life-critical.', 'NEVER self-add to epilepsy regimen. Neurologist required.'),
('herb_brahmi', 'med_levothyroxine', 'moderate', 'theoretical', 'May increase thyroid hormone production (animal data).', 'Monitor TSH. Separate by 2-4 hours.');

-- Tulsi
INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
('herb_tulsi', 'med_antidiabetic_oral', 'moderate', 'theoretical', 'Additive blood glucose lowering. 10-20% reduction in small trials.', 'Monitor glucose.'),
('herb_tulsi', 'med_warfarin', 'moderate', 'theoretical', 'Eugenol inhibits platelet aggregation. Additive bleeding risk.', 'INR monitoring. Inform physician.'),
('herb_tulsi', 'med_aspirin_antiplatelet', 'moderate', 'theoretical', 'Compounded antiplatelet effect.', 'Monitor for unusual bleeding.');

-- Guduchi
INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
('herb_guduchi', 'med_immunosuppressant', 'high', 'pharmacological', 'Guduchi stimulates immune function (Level B evidence). Direct pharmacological opposition.', 'AVOID in transplant patients. Inform physician.'),
('herb_guduchi', 'med_antidiabetic_oral', 'moderate', 'theoretical', 'Berberine has independent glucose-lowering evidence. Additive hypoglycemia.', 'Monitor glucose.');

-- Haridra/Turmeric
INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
('herb_haridra', 'med_warfarin', 'moderate_high', 'pharmacological', 'Curcumin inhibits platelet aggregation + thromboxane synthesis. Piperine further increases drug levels.', 'INR monitoring essential.'),
('herb_haridra', 'med_aspirin_antiplatelet', 'moderate', 'pharmacological', 'Additive antiplatelet effect.', 'Monitor for bleeding.'),
('herb_haridra', 'med_antidiabetic_oral', 'moderate', 'theoretical', 'Additive blood sugar lowering.', 'Monitor glucose.'),
('herb_haridra', 'med_iron_supplement', 'moderate', 'pharmacological', 'Curcumin chelates iron in the gut. Reduces absorption.', 'Separate by 2+ hours.'),
('herb_haridra', 'med_chemotherapy', 'moderate_high', 'theoretical', 'Curcumin antioxidant effects may oppose oxidative chemotherapy mechanism. Some data suggests synergy. Conflicting.', 'Do NOT take during chemotherapy without oncologist approval.'),
('herb_haridra', 'med_tamoxifen', 'moderate', 'theoretical', 'Some in-vitro data suggests curcumin may inhibit Tamoxifen effects.', 'Inform oncologist.');

-- Shatavari
INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
('herb_shatavari', 'med_tamoxifen', 'moderate', 'theoretical', 'Phytoestrogen competition at estrogen receptors may oppose anti-estrogen therapy.', 'Inform oncologist.'),
('herb_shatavari', 'med_antidiabetic_oral', 'low_moderate', 'theoretical', 'Animal data shows blood glucose reduction.', 'Monitor if adding.'),
('herb_shatavari', 'med_lithium', 'low_moderate', 'theoretical', 'Mild diuretic properties may affect lithium clearance.', 'Monitor lithium levels.');


-- ============================
-- EVIDENCE CLAIMS (key claims per herb, with symptom_tags for engine matching)
-- ============================

INSERT INTO evidence_claims (herb_id, claim_id, claim, evidence_grade, summary, mechanism, active_compounds, symptom_tags) VALUES
-- Ashwagandha
('herb_ashwagandha', 'ashwa_stress', 'Stress and cortisol reduction', 'A', 'Multiple RCTs. 14-28% cortisol reduction.', 'HPA axis modulation', ARRAY['withanolides'], ARRAY['stress_anxiety','general_wellness']),
('herb_ashwagandha', 'ashwa_anxiety', 'Anxiety reduction', 'A', 'Several double-blind RCTs.', 'GABAergic activity', ARRAY['withanolides'], ARRAY['stress_anxiety']),
('herb_ashwagandha', 'ashwa_sleep', 'Sleep quality improvement', 'B', 'Clinically meaningful insomnia score improvement.', 'GABAergic activity, triethylene glycol', ARRAY['withanolides','triethylene_glycol'], ARRAY['sleep_issues']),
('herb_ashwagandha', 'ashwa_muscle', 'Muscle strength and recovery', 'B', 'Improved VO2 max and strength in trials.', 'Anabolic, anti-inflammatory', ARRAY['withanolides'], ARRAY['low_energy_fatigue','general_wellness']),
('herb_ashwagandha', 'ashwa_fertility', 'Male fertility (infertile men)', 'B', 'Increased sperm count/motility in infertile men.', 'Antioxidant, hormonal', ARRAY['withanolides'], ARRAY['reproductive_health']),

-- Triphala
('herb_triphala', 'trip_laxative', 'Mild laxative effect', 'A', 'Multiple RCTs. Dose-dependent. Comparable to ispaghula.', 'Increased motility + fluid secretion', ARRAY['tannins','sennosides'], ARRAY['constipation','digestive_issues']),
('herb_triphala', 'trip_oral', 'Oral health (plaque/gingivitis)', 'A', 'Multiple RCTs. Comparable to chlorhexidine.', 'Antimicrobial + anti-inflammatory', ARRAY['gallic_acid','tannins'], ARRAY['general_wellness']),
('herb_triphala', 'trip_antioxidant', 'Antioxidant activity', 'A', 'Extensive data. High ORAC values.', 'Polyphenol free radical scavenging', ARRAY['emblicanin','gallic_acid'], ARRAY['general_wellness']),
('herb_triphala', 'trip_lipid', 'Cholesterol modulation', 'B', 'Small trials show LDL reduction.', 'Bile acid binding, beta-sitosterol', ARRAY['tannins','beta_sitosterol'], ARRAY['cholesterol_concern']),
('herb_triphala', 'trip_glucose', 'Blood glucose regulation', 'B', 'Small trials in T2DM. Modest fasting glucose reduction.', 'Alpha-glucosidase inhibition', ARRAY['chebulagic_acid'], ARRAY['blood_sugar_concern']),

-- Tulsi
('herb_tulsi', 'tulsi_glucose', 'Blood glucose reduction', 'B', '10-20% fasting glucose reduction in small RCTs.', 'Alpha-glucosidase inhibition, insulin sensitization', ARRAY['ursolic_acid','oleanolic_acid'], ARRAY['blood_sugar_concern']),
('herb_tulsi', 'tulsi_oral', 'Oral health', 'B', 'Small RCTs on mouthwash.', 'Antimicrobial + anti-inflammatory', ARRAY['eugenol'], ARRAY['general_wellness']),
('herb_tulsi', 'tulsi_stress', 'Stress/anxiety reduction', 'B-C', 'Limited human RCTs. Positive animal data.', 'GABAergic, serotonergic', ARRAY['ocimumosides'], ARRAY['stress_anxiety']),
('herb_tulsi', 'tulsi_respiratory', 'Respiratory symptom relief', 'C-D', 'Widespread traditional use. Minimal controlled trials.', 'Bronchodilatory (eugenol)', ARRAY['eugenol'], ARRAY['respiratory_cold_cough']),
('herb_tulsi', 'tulsi_immune', 'Immunomodulatory', 'C', 'Strong in-vitro/animal data. No human RCTs for infection reduction.', 'NK cell, cytokine modulation', ARRAY['polysaccharides'], ARRAY['immunity_general']),

-- Brahmi
('herb_brahmi', 'brahmi_memory', 'Memory enhancement (healthy adults)', 'B', 'Multiple small RCTs. Modest improvement in free recall and learning rate. Effect requires 6-12 weeks.', 'Synaptic modulation, dendritic growth', ARRAY['bacosides'], ARRAY['memory_concentration']),
('herb_brahmi', 'brahmi_memory_elderly', 'Memory (elderly)', 'B', 'Small RCTs in older adults. Improved attention and working memory.', 'Antioxidant neuroprotection, cholinergic', ARRAY['bacosides'], ARRAY['memory_concentration']),
('herb_brahmi', 'brahmi_anxiety', 'Anxiety reduction', 'B-C', 'Small trials positive. GABAergic mechanism.', 'GABAergic, serotonergic', ARRAY['bacosides','apigenin'], ARRAY['stress_anxiety']),
('herb_brahmi', 'brahmi_adhd', 'ADHD (children)', 'C', 'One small RCT + open-label. Methodological limitations.', 'Cholinergic, GABAergic', ARRAY['bacosides'], ARRAY['memory_concentration']),

-- Shatavari
('herb_shatavari', 'shat_galactogogue', 'Galactogogue (breast milk increase)', 'B', 'Several small trials. Prolactin modulation likely.', 'Prolactin modulation, nutritional', ARRAY['shatavarins'], ARRAY['reproductive_health']),
('herb_shatavari', 'shat_gastric', 'Gastric protection', 'B-C', 'Animal studies robust. Small human trials for dyspepsia.', 'Mucus secretion, cytoprotective', ARRAY['mucilage','shatavarins'], ARRAY['acidity_reflux','digestive_issues']),
('herb_shatavari', 'shat_female', 'Female reproductive health', 'C', 'Very limited human trials. Traditional use extensive.', 'Spasmolytic, adaptogenic', ARRAY['shatavarins','isoflavones'], ARRAY['menstrual_issues','menopausal_symptoms','reproductive_health']),

-- Guduchi
('herb_guduchi', 'gud_immune', 'Immunomodulatory', 'B', 'Multiple small human trials. Enhanced neutrophil and NK cell activity.', 'Arabinogalactan polysaccharide stimulation', ARRAY['polysaccharides','tinosporin'], ARRAY['immunity_general']),
('herb_guduchi', 'gud_fever', 'Anti-pyretic', 'B-C', 'Small clinical trials in chronic fevers.', 'Anti-inflammatory + immune activation', ARRAY['columbin','tinosporin'], ARRAY['respiratory_cold_cough']),
('herb_guduchi', 'gud_glucose', 'Anti-diabetic', 'B', 'Several small RCTs. Berberine component.', 'Berberine glucose-lowering', ARRAY['berberine','tinocordiside'], ARRAY['blood_sugar_concern']),
('herb_guduchi', 'gud_arthritis', 'Anti-inflammatory (RA/gout)', 'B-C', 'Small trials show symptom improvement.', 'NF-kB inhibition, COX-2 suppression', ARRAY['berberine','tinosporin'], ARRAY['joint_pain']),

-- Haridra
('herb_haridra', 'har_oa', 'Anti-inflammatory (osteoarthritis)', 'B', 'Multiple RCTs for knee OA. Pain reduction comparable to NSAIDs in some trials. No meta-analysis yet.', 'NF-kB and COX-2 inhibition', ARRAY['curcumin'], ARRAY['joint_pain']),
('herb_haridra', 'har_lipid', 'Cholesterol/lipid modulation', 'B', 'Small trials show LDL reduction.', 'Antioxidant, bile acid modulation', ARRAY['curcumin'], ARRAY['cholesterol_concern']),
('herb_haridra', 'har_depression', 'Depression (adjunct)', 'B', 'Small RCTs as adjunct to antidepressants.', 'Anti-neuroinflammation, BDNF upregulation', ARRAY['curcumin'], ARRAY['stress_anxiety']),
('herb_haridra', 'har_glucose', 'Blood sugar regulation', 'B-C', 'Mixed results. Some positive for pre-diabetes.', 'Insulin sensitization', ARRAY['curcumin'], ARRAY['blood_sugar_concern']),

-- Arjuna
('herb_arjuna', 'arj_angina', 'Stable angina relief', 'B', 'Several small RCTs. Reduced angina frequency, improved exercise tolerance.', 'Anti-ischemic, vasodilatory', ARRAY['arjunolic_acid'], ARRAY['heart_health']),
('herb_arjuna', 'arj_hf', 'Heart failure (EF improvement)', 'B', 'Small trials show improved LVEF and exercise capacity.', 'Positive inotropic', ARRAY['arjunolic_acid'], ARRAY['heart_health']),
('herb_arjuna', 'arj_lipid', 'Lipid modulation', 'B', 'Small trials show LDL/HDL improvement.', 'Antioxidant, OPCs', ARRAY['arjunolic_acid','opcs'], ARRAY['cholesterol_concern','heart_health']),

-- Amalaki
('herb_amalaki', 'ama_antioxidant', 'Antioxidant activity', 'A', 'Extensive data. Emblicanin A/B among most potent natural antioxidants.', 'Free radical scavenging', ARRAY['emblicanin','gallic_acid'], ARRAY['general_wellness']),
('herb_amalaki', 'ama_lipid', 'Cholesterol/lipid modulation', 'B', 'Multiple small RCTs. LDL reduction, HDL increase.', 'Polyphenol-mediated', ARRAY['emblicanin','gallic_acid'], ARRAY['cholesterol_concern']),
('herb_amalaki', 'ama_glucose', 'Blood sugar regulation', 'B', 'Small RCTs show fasting glucose and HbA1c reduction.', 'Chromium + polyphenol insulin sensitization', ARRAY['polyphenols','chromium'], ARRAY['blood_sugar_concern']),
('herb_amalaki', 'ama_iron', 'Iron absorption enhancement', 'B', 'Vitamin C + iron co-administration well-established.', 'Ascorbic acid enhances non-heme iron absorption', ARRAY['ascorbic_acid'], ARRAY['low_energy_fatigue','general_wellness']),

-- Yashtimadhu
('herb_yashtimadhu', 'yash_ulcer', 'Peptic ulcer / gastric protection', 'B', 'Carbenoxolone (derivative) was an approved ulcer drug. DGL shows mucosal protection.', 'Prostaglandin synthesis, mucus secretion', ARRAY['glycyrrhizin','glabridin'], ARRAY['acidity_reflux','digestive_issues']),
('herb_yashtimadhu', 'yash_throat', 'Sore throat relief', 'B', 'Multiple small RCTs for post-intubation sore throat.', 'Anti-inflammatory + demulcent', ARRAY['glycyrrhizin'], ARRAY['respiratory_cold_cough']),
('herb_yashtimadhu', 'yash_dyspepsia', 'Functional dyspepsia', 'B', 'GutGard (DGL) — small RCTs show symptom improvement.', 'Mucosal protection', ARRAY['glabridin'], ARRAY['digestive_issues','acidity_reflux']);
