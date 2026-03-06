-- ============================================
-- SEED DATA — 40 NEW HERBS (11-50)
-- Run AFTER seed.sql (which has herbs 1-10)
-- ============================================

-- ============================
-- HERBS (40 new)
-- ============================

INSERT INTO herbs (id, botanical_name, family, names, parts_used, classification, ayurvedic_profile, dosage_ranges, side_effects, misuse_patterns, red_flags, source_monograph) VALUES

('herb_neem', 'Azadirachta indica', 'Meliaceae',
 '{"sanskrit":"Nimba","hindi":"Neem","english":"Neem Tree, Indian Lilac"}'::jsonb,
 ARRAY['leaves','bark','seed oil'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Kusthaghna","Krimighna"]}'::jsonb,
 '{"rasa":["tikta","kashaya"],"guna":["laghu","ruksha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"may_aggravate","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Leaf powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"Bitter. Often in capsules."},{"form":"Neem oil (external)","range_min":"few drops","range_max":"5ml","unit":"topical","notes":"Never ingest neem oil."},{"form":"Leaf juice","range_min":"10ml","range_max":"20ml","unit":"per day","notes":"Very bitter, short courses only"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI upset","Bitter taste/nausea","Lowered blood sugar"],"uncommon":["Headache","Fatigue","Reduced fertility (reversible)"],"rare":["Hepatotoxicity (with oil ingestion)","Reye-like syndrome in children (oil)","Severe hypoglycemia"]}'::jsonb,
 '[{"pattern_id":"neem_misuse_01","title":"Neem oil ingestion","description":"Drinking neem oil for purification or parasite cleansing","why_harmful":"Neem oil is toxic orally. Case reports of fatal poisoning in children.","prevalence":"common"}]'::jsonb,
 '[{"symptom":"Vomiting, seizures after neem oil ingestion","severity":"emergency","action":"STOP. Seek emergency care. Possible Reye-like syndrome.","rationale":"Neem oil toxicity — potentially fatal in children"}]'::jsonb,
 'herbs/neem.md'),

('herb_guggulu', 'Commiphora wightii', 'Burseraceae',
 '{"sanskrit":"Guggulu","hindi":"Guggul","english":"Indian Bdellium"}'::jsonb,
 ARRAY['oleo-gum resin'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Lekhaniya","Medohara"]}'::jsonb,
 '{"rasa":["tikta","katu"],"guna":["laghu","ruksha","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"may_aggravate","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Guggulu extract","range_min":"500mg","range_max":"1000mg","unit":"per day","notes":"Standardized to guggulsterones"},{"form":"Kaishore Guggulu","range_min":"2","range_max":"4","unit":"tablets twice daily","notes":"Classical formulation"},{"form":"Triphala Guggulu","range_min":"2","range_max":"4","unit":"tablets twice daily","notes":"Combined formulation"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI discomfort","Skin rash","Headache"],"uncommon":["Diarrhea","Thyroid stimulation","Menstrual irregularity"],"rare":["Hepatotoxicity","Myopathy","Severe skin reaction"]}'::jsonb,
 '[]'::jsonb,
 '[{"symptom":"Skin rash spreading or severe itching","severity":"urgent","action":"Stop guggulu. May indicate allergy.","rationale":"Contact dermatitis reported"}]'::jsonb,
 'herbs/guggulu.md'),

('herb_moringa', 'Moringa oleifera', 'Moringaceae',
 '{"sanskrit":"Shigru","hindi":"Sahjan, Moringa","english":"Drumstick Tree, Moringa"}'::jsonb,
 ARRAY['leaves','pods','seeds'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Krimighna","Shothahara"]}'::jsonb,
 '{"rasa":["katu","tikta"],"guna":["laghu","ruksha","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"may_aggravate","strength":"mild"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Leaf powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"In smoothies or capsules"},{"form":"Fresh leaves/pods","range_min":"cooked","range_max":"as food","unit":"daily","notes":"Safest form as dietary vegetable"},{"form":"Seed extract","range_min":"500mg","range_max":"1000mg","unit":"per day","notes":"Less studied than leaves"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI discomfort","Laxative effect","Lowered blood sugar"],"uncommon":["Heartburn","Nausea at high doses"],"rare":["Liver enzyme elevation","Genotoxicity concerns (root/bark extracts)"]}'::jsonb,
 '[{"pattern_id":"mor_misuse_01","title":"Superfood overconsumption","description":"Megadosing moringa powder (10-20g/day) based on social media claims","why_harmful":"Excessive intake can cause GI distress and liver stress. Root and bark have toxic alkaloids.","prevalence":"common"}]'::jsonb,
 '[]'::jsonb,
 'herbs/moringa.md'),

('herb_gokshura', 'Tribulus terrestris', 'Zygophyllaceae',
 '{"sanskrit":"Gokshura","hindi":"Gokhru","english":"Puncture Vine, Tribulus"}'::jsonb,
 ARRAY['fruit','root'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Mutrala","Shukra Janana"]}'::jsonb,
 '{"rasa":["madhura"],"guna":["guru","snigdha"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"may_aggravate","strength":"mild"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Fruit powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm water or milk"},{"form":"Standardized extract","range_min":"250mg","range_max":"750mg","unit":"per day","notes":"Standardized to saponins"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Stomach upset","Increased urination"],"uncommon":["Sleep disturbance","Breast enlargement (gynecomastia)"],"rare":["Kidney damage (case report of nephrotoxicity)","Hepatotoxicity"]}'::jsonb,
 '[]'::jsonb,
 '[{"symptom":"Dark urine, reduced urine output, flank pain","severity":"urgent","action":"Stop. Check renal function.","rationale":"Nephrotoxicity case reports"}]'::jsonb,
 'herbs/gokshura.md'),

('herb_punarnava', 'Boerhavia diffusa', 'Nyctaginaceae',
 '{"sanskrit":"Punarnava","hindi":"Punarnava, Gadapurna","english":"Spreading Hogweed"}'::jsonb,
 ARRAY['whole plant','root'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Shothahara","Mutrala"]}'::jsonb,
 '{"rasa":["madhura","tikta","kashaya"],"guna":["laghu","ruksha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm water"},{"form":"Fresh juice","range_min":"10ml","range_max":"20ml","unit":"per day","notes":"Traditional preparation"},{"form":"Punarnava Mandoor","range_min":"2","range_max":"4","unit":"tablets twice daily","notes":"Classical iron formulation"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Mild diuresis","GI upset"],"uncommon":["Dizziness (hypotension)","Electrolyte imbalance"],"rare":["Severe hypotension","Hypokalemia"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/punarnava.md'),

('herb_shilajit', 'Asphaltum punjabinum', 'Mineral',
 '{"sanskrit":"Shilajatu","hindi":"Shilajit","english":"Mineral Pitch, Rock Tar"}'::jsonb,
 ARRAY['purified exudate'],
 '{"rasayana":true,"medhya":true,"hridya":false,"classical_groups":["Rasayana","Yogavahi"]}'::jsonb,
 '{"rasa":["tikta","kashaya"],"guna":["guru","snigdha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"mixed","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Only use purified (Shuddha) Shilajit from verified sources.","forms":[{"form":"Purified resin","range_min":"250mg","range_max":"500mg","unit":"per day","notes":"Dissolved in warm milk or water"},{"form":"Capsules","range_min":"250mg","range_max":"500mg","unit":"per day","notes":"Standardized fulvic acid content"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Metallic taste","Increased body heat","GI discomfort"],"uncommon":["Headache","Dizziness","Skin rash"],"rare":["Heavy metal contamination (unpurified)","Elevated uric acid","Allergic reaction"]}'::jsonb,
 '[{"pattern_id":"shil_misuse_01","title":"Unpurified/adulterated shilajit","description":"Consuming raw or unverified shilajit products","why_harmful":"Raw shilajit contains heavy metals (lead, arsenic, mercury). Only purified forms are safe.","prevalence":"very_common"}]'::jsonb,
 '[{"symptom":"Metallic taste persisting, abdominal pain, joint pain","severity":"urgent","action":"Stop. Check heavy metal levels.","rationale":"Heavy metal contamination risk"}]'::jsonb,
 'herbs/shilajit.md'),

('herb_kutki', 'Picrorhiza kurroa', 'Plantaginaceae',
 '{"sanskrit":"Katuka","hindi":"Kutki","english":"Kutki, Hellebore"}'::jsonb,
 ARRAY['rhizome','root'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Tikta Skandha","Yakrit Uttejaka"]}'::jsonb,
 '{"rasa":["tikta"],"guna":["laghu","ruksha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"may_aggravate","strength":"mild"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"Very bitter. Often with honey."},{"form":"Standardized extract","range_min":"200mg","range_max":"600mg","unit":"per day","notes":"Kutkin-standardized"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Intense bitter taste","Nausea","Loose stools"],"uncommon":["Abdominal cramps","Anorexia"],"rare":["Skin rash","Hepatotoxicity at high doses"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/kutki.md'),

('herb_bhringaraj', 'Eclipta prostrata', 'Asteraceae',
 '{"sanskrit":"Bhringaraja","hindi":"Bhringaraj, Bhangra","english":"False Daisy"}'::jsonb,
 ARRAY['whole herb','leaves'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Keshya","Yakritottejaka"]}'::jsonb,
 '{"rasa":["tikta","katu"],"guna":["laghu","ruksha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"mixed","strength":"mild"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Leaf powder","range_min":"2g","range_max":"5g","unit":"per day","notes":"With warm water"},{"form":"Bhringaraj oil (external)","range_min":"as needed","range_max":"scalp massage","unit":"topical","notes":"Traditional hair oil"},{"form":"Bhringaraj juice","range_min":"10ml","range_max":"20ml","unit":"per day","notes":"Fresh juice or preserved"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI upset","Bitter taste"],"uncommon":["Dizziness","Skin irritation (topical)"],"rare":["Allergic contact dermatitis"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/bhringaraj.md'),

('herb_shankhapushpi', 'Convolvulus pluricaulis', 'Convolvulaceae',
 '{"sanskrit":"Shankhapushpi","hindi":"Shankhpushpi","english":"Butterfly Pea (distinct species)"}'::jsonb,
 ARRAY['whole plant'],
 '{"rasayana":true,"medhya":true,"hridya":false,"classical_groups":["Medhya Rasayana"]}'::jsonb,
 '{"rasa":["tikta","kashaya"],"guna":["snigdha"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"may_aggravate","strength":"mild"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Whole plant powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With milk"},{"form":"Syrup","range_min":"10ml","range_max":"20ml","unit":"twice daily","notes":"Commercial preparations common"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Drowsiness","Mild GI upset"],"uncommon":["Reduced appetite","Excessive sedation"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/shankhapushpi.md'),

('herb_vidanga', 'Embelia ribes', 'Primulaceae',
 '{"sanskrit":"Vidanga","hindi":"Vidanga, Baberang","english":"White-flowered Embelia"}'::jsonb,
 ARRAY['fruit'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Krimighna"]}'::jsonb,
 '{"rasa":["katu","kashaya"],"guna":["laghu","ruksha","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"mild"},"pitta":{"effect":"may_aggravate","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Fruit powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"Short courses only (7-14 days)"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI irritation","Burning sensation"],"uncommon":["Nausea","Diarrhea"],"rare":["Male antifertility effects (animal data)"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/vidanga.md'),

('herb_vacha', 'Acorus calamus', 'Acoraceae',
 '{"sanskrit":"Vacha","hindi":"Bach, Vacha","english":"Sweet Flag, Calamus"}'::jsonb,
 ARRAY['rhizome'],
 '{"rasayana":false,"medhya":true,"hridya":false,"classical_groups":["Medhya","Sanjna Sthapana"]}'::jsonb,
 '{"rasa":["katu","tikta"],"guna":["laghu","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"may_aggravate","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Beta-asarone content is a safety concern. Indian diploid variety has lowest beta-asarone.","forms":[{"form":"Rhizome powder","range_min":"250mg","range_max":"500mg","unit":"per day","notes":"LOW dose. Indian diploid variety only."}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI irritation","Nausea","Vomiting"],"uncommon":["Sedation","Headache"],"rare":["Carcinogenicity (beta-asarone, tetraploid variety)","Hepatotoxicity"]}'::jsonb,
 '[{"pattern_id":"vach_misuse_01","title":"Wrong variety consumption","description":"Using European/Chinese tetraploid Acorus calamus (high beta-asarone)","why_harmful":"Beta-asarone is carcinogenic. Banned by FDA. Indian diploid has lowest levels.","prevalence":"moderate"}]'::jsonb,
 '[{"symptom":"Persistent nausea, vomiting after ingestion","severity":"urgent","action":"Stop immediately. Seek care if symptoms persist.","rationale":"GI toxicity / wrong variety risk"}]'::jsonb,
 'herbs/vacha.md'),

('herb_pippali', 'Piper longum', 'Piperaceae',
 '{"sanskrit":"Pippali","hindi":"Pippal, Pippali","english":"Long Pepper"}'::jsonb,
 ARRAY['fruit','root'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Deepaniya","Pippalyadi Varga"]}'::jsonb,
 '{"rasa":["katu"],"guna":["laghu","snigdha","tikshna"],"virya":"anushna_sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"may_aggravate","strength":"mild"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Fruit powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"With honey or warm water"},{"form":"Pippali Rasayana","range_min":"variable","range_max":"per protocol","unit":"classical","notes":"Graduated dosing protocol in Charaka Samhita"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Burning sensation","GI warmth","Increased appetite"],"uncommon":["Acidity","Loose stools"],"rare":["Aggravation of bleeding disorders"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/pippali.md'),

('herb_maricha', 'Piper nigrum', 'Piperaceae',
 '{"sanskrit":"Maricha","hindi":"Kali Mirch","english":"Black Pepper"}'::jsonb,
 ARRAY['fruit'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya","Trikatu"]}'::jsonb,
 '{"rasa":["katu"],"guna":["laghu","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"mild"},"pitta":{"effect":"aggravates","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Culinary amounts are safe. Supplement-dose piperine has drug interactions.","forms":[{"form":"Ground pepper (culinary)","range_min":"1g","range_max":"3g","unit":"per day","notes":"Normal cooking amounts. Safe."},{"form":"Piperine extract (BioPerine)","range_min":"5mg","range_max":"20mg","unit":"per day","notes":"Bioavailability enhancer. Has drug interactions."}],"long_term_safety_data":true}'::jsonb,
 '{"common":["GI irritation at high doses","Burning sensation","Sneezing"],"uncommon":["Acidity/reflux"],"rare":["Drug interaction via CYP3A4/CYP2D6 inhibition"]}'::jsonb,
 '[{"pattern_id":"mar_misuse_01","title":"Piperine + drug interactions ignored","description":"Taking BioPerine supplements alongside prescription medications","why_harmful":"Piperine inhibits CYP3A4, CYP2D6, CYP1A2. Increases blood levels of most co-administered drugs.","prevalence":"very_common"}]'::jsonb,
 '[]'::jsonb,
 'herbs/maricha.md'),

('herb_shunthi', 'Zingiber officinale', 'Zingiberaceae',
 '{"sanskrit":"Shunthi (dry), Ardraka (fresh)","hindi":"Sonth (dry), Adrak (fresh)","english":"Ginger"}'::jsonb,
 ARRAY['rhizome'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya","Trikatu","Shulahara"]}'::jsonb,
 '{"rasa":["katu"],"guna":["laghu","snigdha"],"virya":"ushna","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"may_aggravate","strength":"mild"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Fresh ginger","range_min":"5g","range_max":"10g","unit":"per day","notes":"In cooking or as tea"},{"form":"Dry ginger powder (Sonth)","range_min":"1g","range_max":"3g","unit":"per day","notes":"More potent than fresh"},{"form":"Standardized extract","range_min":"250mg","range_max":"1000mg","unit":"per day","notes":"5% gingerols typical"}],"long_term_safety_data":true}'::jsonb,
 '{"common":["Heartburn","GI warmth","Mild blood thinning"],"uncommon":["Diarrhea","Skin irritation (topical)"],"rare":["Gallstone colic (stimulates bile)","Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/shunthi.md'),

('herb_dalchini', 'Cinnamomum verum', 'Lauraceae',
 '{"sanskrit":"Twak","hindi":"Dalchini","english":"Cinnamon, True Cinnamon"}'::jsonb,
 ARRAY['bark'],
 '{"rasayana":false,"medhya":false,"hridya":true,"classical_groups":["Deepaniya"]}'::jsonb,
 '{"rasa":["katu","madhura","tikta"],"guna":["laghu","ruksha","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"may_aggravate","strength":"mild"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Cassia cinnamon (C. cassia) has high coumarin — use Ceylon/true cinnamon for supplement doses.","forms":[{"form":"Powder (culinary)","range_min":"1g","range_max":"3g","unit":"per day","notes":"Ceylon variety preferred"},{"form":"Extract","range_min":"250mg","range_max":"500mg","unit":"per day","notes":"Standardized"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI warmth","Mouth/lip irritation"],"uncommon":["Liver stress (Cassia variety, coumarin)"],"rare":["Hepatotoxicity (Cassia at high doses)","Allergic contact stomatitis"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/dalchini.md'),

('herb_elaichi', 'Elettaria cardamomum', 'Zingiberaceae',
 '{"sanskrit":"Ela","hindi":"Elaichi, Chhoti Elaichi","english":"Green Cardamom"}'::jsonb,
 ARRAY['fruit','seeds'],
 '{"rasayana":false,"medhya":false,"hridya":true,"classical_groups":["Shvasahara"]}'::jsonb,
 '{"rasa":["katu","madhura"],"guna":["laghu","ruksha"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"mild"},"pitta":{"effect":"pacifies","strength":"mild"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Whole pods","range_min":"2","range_max":"5","unit":"pods per day","notes":"Chewed or in chai"},{"form":"Seed powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"After meals for digestion"}],"long_term_safety_data":true}'::jsonb,
 '{"common":["Generally very safe at culinary doses"],"uncommon":["GI discomfort at high doses"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/elaichi.md'),

('herb_lavanga', 'Syzygium aromaticum', 'Myrtaceae',
 '{"sanskrit":"Lavanga","hindi":"Laung","english":"Clove"}'::jsonb,
 ARRAY['flower buds','essential oil'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya"]}'::jsonb,
 '{"rasa":["katu","tikta"],"guna":["laghu","tikshna","snigdha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"mixed","strength":"mild"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Whole cloves","range_min":"2","range_max":"5","unit":"cloves per day","notes":"Chewed for toothache or in cooking"},{"form":"Clove oil (topical)","range_min":"diluted","range_max":"few drops","unit":"topical","notes":"Never ingest pure clove oil"}],"long_term_safety_data":true}'::jsonb,
 '{"common":["Mouth numbness (eugenol)","GI warmth"],"uncommon":["Nausea at high doses"],"rare":["Hepatotoxicity (oil ingestion)","Bleeding risk (eugenol antiplatelet)"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/lavanga.md'),

('herb_methi', 'Trigonella foenum-graecum', 'Fabaceae',
 '{"sanskrit":"Methika","hindi":"Methi","english":"Fenugreek"}'::jsonb,
 ARRAY['seeds','leaves'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya"]}'::jsonb,
 '{"rasa":["tikta","katu"],"guna":["laghu","snigdha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"may_aggravate","strength":"mild"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Seeds (soaked overnight)","range_min":"5g","range_max":"10g","unit":"per day","notes":"Traditional preparation"},{"form":"Seed powder","range_min":"5g","range_max":"10g","unit":"per day","notes":"With water before meals"},{"form":"Extract","range_min":"500mg","range_max":"1000mg","unit":"per day","notes":"Standardized to saponins"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Maple syrup body odor","GI gas/bloating","Diarrhea"],"uncommon":["Hypoglycemia","Uterine stimulation"],"rare":["Allergic reaction (legume cross-reactivity)"]}'::jsonb,
 '[]'::jsonb,
 '[{"symptom":"Signs of hypoglycemia with antidiabetic drugs","severity":"urgent","action":"Stop fenugreek. Check glucose.","rationale":"Additive blood sugar lowering"}]'::jsonb,
 'herbs/methi.md'),

('herb_kalmegh', 'Andrographis paniculata', 'Acanthaceae',
 '{"sanskrit":"Kalmegh","hindi":"Kalmegh, Kirayat","english":"King of Bitters, Andrographis"}'::jsonb,
 ARRAY['leaves','whole herb'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Tikta Skandha"]}'::jsonb,
 '{"rasa":["tikta"],"guna":["laghu","ruksha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"may_aggravate","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Leaf powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"Extremely bitter"},{"form":"Standardized extract (andrographolide)","range_min":"100mg","range_max":"200mg","unit":"per day","notes":"Kan Jang and similar products"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Intense bitter taste","Nausea","Loss of appetite"],"uncommon":["Headache","Fatigue","Diarrhea"],"rare":["Allergic reaction","Anaphylaxis (rare)","Male infertility (animal data, high doses)"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/kalmegh.md'),

('herb_manjistha', 'Rubia cordifolia', 'Rubiaceae',
 '{"sanskrit":"Manjistha","hindi":"Manjith","english":"Indian Madder"}'::jsonb,
 ARRAY['root','stem'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Varnya","Vishaghna"]}'::jsonb,
 '{"rasa":["tikta","kashaya","madhura"],"guna":["guru","ruksha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"mild"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm water or milk"},{"form":"Extract","range_min":"250mg","range_max":"500mg","unit":"per day","notes":"Standardized"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Red-tinged urine (harmless)","GI upset"],"uncommon":["Menstrual changes"],"rare":["Uterine stimulation"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/manjistha.md'),

('herb_chitrak', 'Plumbago zeylanica', 'Plumbaginaceae',
 '{"sanskrit":"Chitrak","hindi":"Chitrak, Chita","english":"Ceylon Leadwort"}'::jsonb,
 ARRAY['root'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya","Shulahara"]}'::jsonb,
 '{"rasa":["katu"],"guna":["laghu","ruksha","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"aggravates","strength":"strong"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Potent herb — use low doses only and avoid in pregnancy.","forms":[{"form":"Root powder","range_min":"500mg","range_max":"1g","unit":"per day","notes":"LOW dose. Very potent."}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI irritation","Burning sensation","Increased heat"],"uncommon":["Diarrhea","Skin irritation"],"rare":["Abortifacient effects","Severe GI inflammation","Skin blistering (topical)"]}'::jsonb,
 '[]'::jsonb,
 '[{"symptom":"Severe abdominal pain, bloody stools","severity":"emergency","action":"STOP. Seek immediate medical care.","rationale":"Plumbagin toxicity — GI mucosal damage"}]'::jsonb,
 'herbs/chitrak.md'),

('herb_bala', 'Sida cordifolia', 'Malvaceae',
 '{"sanskrit":"Bala","hindi":"Bala, Bariar","english":"Country Mallow"}'::jsonb,
 ARRAY['root','whole plant'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Balya","Brimhaniya"]}'::jsonb,
 '{"rasa":["madhura"],"guna":["guru","snigdha","picchila"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"may_aggravate","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Contains ephedrine alkaloids — banned as dietary supplement in some countries.","forms":[{"form":"Root powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"Traditional Ayurvedic use. Low ephedrine content."},{"form":"Bala Taila (oil)","range_min":"external","range_max":"massage","unit":"topical","notes":"Classical oil preparation"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Mild stimulation","Increased energy"],"uncommon":["Insomnia","Heart palpitations","Increased BP"],"rare":["Cardiac arrhythmia (ephedrine content)","Stroke (with stimulant combinations)"]}'::jsonb,
 '[]'::jsonb,
 '[{"symptom":"Heart palpitations, rapid heartbeat, chest discomfort","severity":"urgent","action":"Stop immediately. Check cardiac status.","rationale":"Ephedrine alkaloid effects"}]'::jsonb,
 'herbs/bala.md'),

('herb_jatamansi', 'Nardostachys jatamansi', 'Caprifoliaceae',
 '{"sanskrit":"Jatamansi","hindi":"Jatamansi, Balchhar","english":"Spikenard, Indian Nard"}'::jsonb,
 ARRAY['rhizome','root'],
 '{"rasayana":false,"medhya":true,"hridya":false,"classical_groups":["Medhya","Nidrajanana"]}'::jsonb,
 '{"rasa":["tikta","kashaya","madhura"],"guna":["laghu","snigdha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"mixed","strength":"mild"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Endangered species — use sustainably sourced only.","forms":[{"form":"Root powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"Earthy smell. With milk at bedtime."},{"form":"Oil (external)","range_min":"few drops","range_max":"scalp/body","unit":"topical","notes":"Calming aromatherapy"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Drowsiness","Earthy body odor"],"uncommon":["GI upset","Headache"],"rare":["Excessive sedation","Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/jatamansi.md'),

('herb_kumari', 'Aloe vera', 'Asphodelaceae',
 '{"sanskrit":"Kumari","hindi":"Gheekumari, Gwarpatha","english":"Aloe Vera"}'::jsonb,
 ARRAY['leaf gel','leaf latex'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Bhedaniya"]}'::jsonb,
 '{"rasa":["tikta","madhura"],"guna":["guru","snigdha","picchila"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"may_aggravate","strength":"mild"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Gel (inner fillet) is safe. Latex (yellow sap) is a strong laxative — use cautiously.","forms":[{"form":"Gel (inner fillet)","range_min":"20ml","range_max":"50ml","unit":"per day","notes":"Safe. External or oral."},{"form":"Juice","range_min":"15ml","range_max":"30ml","unit":"per day","notes":"Ensure decolorized/purified"},{"form":"Kumaryasava","range_min":"15ml","range_max":"30ml","unit":"twice daily","notes":"Classical fermented preparation"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Diarrhea (latex)","Abdominal cramps","Lowered blood sugar"],"uncommon":["Electrolyte imbalance","Skin irritation"],"rare":["Hepatotoxicity (oral, rare reports)","Kidney damage (chronic latex use)"]}'::jsonb,
 '[]'::jsonb,
 '[{"symptom":"Persistent diarrhea, cramps from aloe latex","severity":"urgent","action":"Stop. Rehydrate. Check electrolytes.","rationale":"Anthraquinone laxative abuse"}]'::jsonb,
 'herbs/kumari.md'),

('herb_tagar', 'Valeriana wallichii', 'Caprifoliaceae',
 '{"sanskrit":"Tagara","hindi":"Tagar","english":"Indian Valerian"}'::jsonb,
 ARRAY['rhizome','root'],
 '{"rasayana":false,"medhya":true,"hridya":false,"classical_groups":["Nidrajanana"]}'::jsonb,
 '{"rasa":["tikta","katu","kashaya"],"guna":["laghu","snigdha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"mixed","strength":"mild"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root powder","range_min":"1g","range_max":"3g","unit":"at bedtime","notes":"Strong smell. With warm milk."},{"form":"Extract","range_min":"200mg","range_max":"600mg","unit":"at bedtime","notes":"Standardized to valerenic acid"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Drowsiness","Headache","GI upset"],"uncommon":["Vivid dreams","Morning grogginess"],"rare":["Hepatotoxicity (rare reports)","Paradoxical stimulation"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/tagar.md'),

('herb_musta', 'Cyperus rotundus', 'Cyperaceae',
 '{"sanskrit":"Musta","hindi":"Nagarmotha, Motha","english":"Nut Grass"}'::jsonb,
 ARRAY['rhizome'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya","Grahi"]}'::jsonb,
 '{"rasa":["tikta","katu","kashaya"],"guna":["laghu","ruksha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"mixed","strength":"mild"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Rhizome powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm water"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Generally well tolerated"],"uncommon":["GI discomfort"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/musta.md'),

('herb_haritaki', 'Terminalia chebula', 'Combretaceae',
 '{"sanskrit":"Haritaki","hindi":"Harad, Haritaki","english":"Chebulic Myrobalan"}'::jsonb,
 ARRAY['fruit'],
 '{"rasayana":true,"medhya":true,"hridya":false,"classical_groups":["Tridoshahara","Rasayana"]}'::jsonb,
 '{"rasa":["all_five_predominant_kashaya"],"guna":["laghu","ruksha"],"virya":"ushna","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Fruit powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm water. Bedtime for laxative."},{"form":"Tablet","range_min":"500mg","range_max":"1000mg","unit":"1-2 times daily","notes":"Convenient form"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Loose stools","Mild cramping","Gas"],"uncommon":["Dehydration with excess use"],"rare":["Electrolyte imbalance"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/haritaki.md'),

('herb_bibhitaki', 'Terminalia bellirica', 'Combretaceae',
 '{"sanskrit":"Bibhitaki","hindi":"Baheda, Bahera","english":"Belleric Myrobalan"}'::jsonb,
 ARRAY['fruit'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Kasahara"]}'::jsonb,
 '{"rasa":["kashaya"],"guna":["laghu","ruksha"],"virya":"ushna","vipaka":"madhura","dosha_action":{"vata":{"effect":"mixed","strength":"mild"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Fruit powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With honey or warm water"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI discomfort","Loose stools"],"uncommon":["Bloating"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/bibhitaki.md'),

('herb_sariva', 'Hemidesmus indicus', 'Apocynaceae',
 '{"sanskrit":"Sariva","hindi":"Anantamool","english":"Indian Sarsaparilla"}'::jsonb,
 ARRAY['root'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Raktaprasadana","Daha Prashamana"]}'::jsonb,
 '{"rasa":["madhura","tikta"],"guna":["guru","snigdha"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"mixed","strength":"mild"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With milk or water"},{"form":"Sarivadyasava","range_min":"15ml","range_max":"30ml","unit":"twice daily","notes":"Classical formulation"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Generally well tolerated"],"uncommon":["Mild GI upset"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/sariva.md'),

('herb_chirata', 'Swertia chirayita', 'Gentianaceae',
 '{"sanskrit":"Kiratatikta","hindi":"Chirata, Chirayita","english":"Chiretta"}'::jsonb,
 ARRAY['whole plant'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Tikta Skandha"]}'::jsonb,
 '{"rasa":["tikta"],"guna":["laghu","ruksha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"may_aggravate","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Whole herb powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"Extremely bitter. In water or capsules."},{"form":"Infusion","range_min":"5g","range_max":"10g","unit":"soaked overnight","notes":"Strain and drink"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Intense bitter taste","Nausea","Loss of appetite"],"uncommon":["Vomiting at high doses","Diarrhea"],"rare":["Hypoglycemia"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/chirata.md'),

('herb_ajwain', 'Trachyspermum ammi', 'Apiaceae',
 '{"sanskrit":"Yavani","hindi":"Ajwain","english":"Carom Seeds, Bishop Weed"}'::jsonb,
 ARRAY['seeds'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya","Shulahara"]}'::jsonb,
 '{"rasa":["katu","tikta"],"guna":["laghu","ruksha","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"may_aggravate","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Seeds (chewed)","range_min":"2g","range_max":"5g","unit":"per day","notes":"After meals for digestion"},{"form":"Ajwain water","range_min":"1 tsp","range_max":"in warm water","unit":"as needed","notes":"Traditional digestive remedy"}],"long_term_safety_data":true}'::jsonb,
 '{"common":["Mouth/throat burning","GI warmth"],"uncommon":["Acidity"],"rare":["Skin photosensitivity"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/ajwain.md'),

('herb_jeera', 'Cuminum cyminum', 'Apiaceae',
 '{"sanskrit":"Jiraka","hindi":"Jeera, Zeera","english":"Cumin"}'::jsonb,
 ARRAY['seeds'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya"]}'::jsonb,
 '{"rasa":["katu"],"guna":["laghu","ruksha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"mixed","strength":"mild"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Seeds (culinary)","range_min":"3g","range_max":"6g","unit":"per day","notes":"Normal cooking. Very safe."},{"form":"Jeera water","range_min":"1 tsp","range_max":"soaked overnight","unit":"morning","notes":"Traditional remedy"}],"long_term_safety_data":true}'::jsonb,
 '{"common":["Generally very safe at culinary doses"],"uncommon":["Heartburn at very high doses"],"rare":["Allergic reaction (Apiaceae family)"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/jeera.md'),

('herb_kalonji', 'Nigella sativa', 'Ranunculaceae',
 '{"sanskrit":"Krishna Jiraka","hindi":"Kalonji, Mangrelha","english":"Black Seed, Black Cumin"}'::jsonb,
 ARRAY['seeds','seed oil'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Deepaniya"]}'::jsonb,
 '{"rasa":["katu","tikta"],"guna":["laghu","ruksha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"mild"},"pitta":{"effect":"may_aggravate","strength":"mild"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Seeds","range_min":"2g","range_max":"5g","unit":"per day","notes":"Crushed or whole. With honey."},{"form":"Seed oil","range_min":"2.5ml","range_max":"5ml","unit":"per day","notes":"Cold pressed"},{"form":"Thymoquinone extract","range_min":"varies","range_max":"","unit":"per day","notes":"Active compound. Less traditional."}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI upset","Bitter/pungent taste"],"uncommon":["Skin rash (topical)","Lowered blood pressure"],"rare":["Hepatotoxicity at very high doses","Contact dermatitis"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/kalonji.md'),

('herb_isabgol', 'Plantago ovata', 'Plantaginaceae',
 '{"sanskrit":"Ashvagola","hindi":"Isabgol","english":"Psyllium Husk"}'::jsonb,
 ARRAY['seed husk'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Bhedaniya"]}'::jsonb,
 '{"rasa":["madhura","kashaya"],"guna":["guru","snigdha","picchila"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"may_aggravate","strength":"mild"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Husk powder","range_min":"5g","range_max":"10g","unit":"1-2 times daily","notes":"ALWAYS with full glass of water. Never dry."}],"long_term_safety_data":true}'::jsonb,
 '{"common":["Bloating","Gas","Mild cramping"],"uncommon":["Esophageal obstruction (if taken without water)","Allergic reaction"],"rare":["Intestinal obstruction","Anaphylaxis (occupational exposure)"]}'::jsonb,
 '[{"pattern_id":"isab_misuse_01","title":"Taking without water","description":"Swallowing isabgol husk without adequate water","why_harmful":"Swells in esophagus/GI tract. Can cause choking or intestinal obstruction.","prevalence":"common"}]'::jsonb,
 '[{"symptom":"Choking, difficulty swallowing, severe abdominal pain","severity":"emergency","action":"Seek immediate medical care.","rationale":"Esophageal or intestinal obstruction"}]'::jsonb,
 'herbs/isabgol.md'),

('herb_senna', 'Cassia angustifolia', 'Fabaceae',
 '{"sanskrit":"Markandika","hindi":"Senna, Sanay","english":"Senna"}'::jsonb,
 ARRAY['leaves','pods'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Bhedaniya"]}'::jsonb,
 '{"rasa":["tikta","katu","madhura"],"guna":["laghu","ruksha","tikshna"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"moderate"},"pitta":{"effect":"may_aggravate","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Short-term use only (max 1-2 weeks).","forms":[{"form":"Leaf tea","range_min":"0.5g","range_max":"2g","unit":"at bedtime","notes":"Steep 10 min. SHORT-TERM ONLY."},{"form":"Standardized extract","range_min":"15mg","range_max":"30mg","unit":"sennosides at bedtime","notes":"Max 1-2 weeks"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Abdominal cramps","Diarrhea","Brown urine (harmless)"],"uncommon":["Electrolyte depletion","Dehydration","Finger clubbing (chronic use)"],"rare":["Melanosis coli (chronic)","Laxative dependency","Hepatotoxicity"]}'::jsonb,
 '[{"pattern_id":"senna_misuse_01","title":"Chronic daily laxative use","description":"Using senna daily for weeks-months as bowel regulator","why_harmful":"Creates dependency. Causes melanosis coli. Electrolyte depletion. Masks underlying pathology.","prevalence":"very_common"}]'::jsonb,
 '[{"symptom":"Severe cramps, bloody diarrhea, weakness","severity":"urgent","action":"Stop. Rehydrate. Check electrolytes.","rationale":"Electrolyte depletion and GI damage"}]'::jsonb,
 'herbs/senna.md'),

('herb_safed_musli', 'Chlorophytum borivilianum', 'Asparagaceae',
 '{"sanskrit":"Musali","hindi":"Safed Musli","english":"White Musli"}'::jsonb,
 ARRAY['tuberous root'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Vajikara","Balya"]}'::jsonb,
 '{"rasa":["madhura"],"guna":["guru","snigdha"],"virya":"sheeta","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"may_aggravate","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm milk"},{"form":"Capsules","range_min":"500mg","range_max":"1000mg","unit":"per day","notes":"Standardized"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Weight gain","Increased mucus"],"uncommon":["GI heaviness"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/safed_musli.md'),

('herb_kapikacchu', 'Mucuna pruriens', 'Fabaceae',
 '{"sanskrit":"Kapikacchu","hindi":"Kaunch beej, Kevach","english":"Velvet Bean, Cowhage"}'::jsonb,
 ARRAY['seeds'],
 '{"rasayana":true,"medhya":false,"hridya":false,"classical_groups":["Vajikara","Balya"]}'::jsonb,
 '{"rasa":["madhura","tikta"],"guna":["guru","snigdha"],"virya":"ushna","vipaka":"madhura","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"mixed","strength":"mild"},"kapha":{"effect":"may_aggravate","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription. Contains L-DOPA — interact with Parkinson medications.","forms":[{"form":"Seed powder","range_min":"3g","range_max":"5g","unit":"per day","notes":"Processed seeds only. Raw causes itching."},{"form":"Standardized extract (15-20% L-DOPA)","range_min":"200mg","range_max":"500mg","unit":"per day","notes":"L-DOPA content varies. Start low."}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Nausea","Insomnia","Headache"],"uncommon":["Vivid dreams","Tachycardia","Agitation"],"rare":["Psychosis (high dose L-DOPA)","Hair loss","Priapism"]}'::jsonb,
 '[{"pattern_id":"kap_misuse_01","title":"Testosterone booster marketing","description":"Sold as natural testosterone booster to gym-goers at high doses","why_harmful":"L-DOPA dopaminergic effects at high doses can cause psychiatric side effects. Testosterone claims poorly supported.","prevalence":"common"}]'::jsonb,
 '[{"symptom":"Agitation, confusion, hallucinations","severity":"urgent","action":"Stop immediately. Seek psychiatric evaluation.","rationale":"L-DOPA toxicity — dopaminergic crisis"}]'::jsonb,
 'herbs/kapikacchu.md'),

('herb_rasna', 'Pluchea lanceolata', 'Asteraceae',
 '{"sanskrit":"Rasna","hindi":"Rasna","english":"Rasna"}'::jsonb,
 ARRAY['leaves','root'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Shulahara","Vatahara"]}'::jsonb,
 '{"rasa":["tikta"],"guna":["guru","snigdha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"strong"},"pitta":{"effect":"mixed","strength":"mild"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Root/leaf powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With warm water"},{"form":"Rasnadi Kwatha","range_min":"30ml","range_max":"60ml","unit":"twice daily","notes":"Classical decoction"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["GI upset"],"uncommon":["Nausea"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/rasna.md'),

('herb_lodhra', 'Symplocos racemosa', 'Symplocaceae',
 '{"sanskrit":"Lodhra","hindi":"Lodh","english":"Symplocos Bark"}'::jsonb,
 ARRAY['bark'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Sandhaniya","Stambhana"]}'::jsonb,
 '{"rasa":["kashaya"],"guna":["laghu","ruksha"],"virya":"sheeta","vipaka":"katu","dosha_action":{"vata":{"effect":"may_aggravate","strength":"mild"},"pitta":{"effect":"pacifies","strength":"strong"},"kapha":{"effect":"pacifies","strength":"strong"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Bark powder","range_min":"3g","range_max":"6g","unit":"per day","notes":"With honey or water"},{"form":"Lodhradi Kwatha","range_min":"30ml","range_max":"60ml","unit":"twice daily","notes":"Classical decoction"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Constipation (astringent)","GI discomfort"],"uncommon":["Dry mouth"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/lodhra.md'),

('herb_nagkesar', 'Mesua ferrea', 'Calophyllaceae',
 '{"sanskrit":"Nagakeshara","hindi":"Nagkesar","english":"Ironwood Tree, Cobra Saffron"}'::jsonb,
 ARRAY['flower stamens','seeds'],
 '{"rasayana":false,"medhya":false,"hridya":false,"classical_groups":["Raktapittahara"]}'::jsonb,
 '{"rasa":["tikta","kashaya"],"guna":["laghu","ruksha"],"virya":"ushna","vipaka":"katu","dosha_action":{"vata":{"effect":"pacifies","strength":"mild"},"pitta":{"effect":"pacifies","strength":"moderate"},"kapha":{"effect":"pacifies","strength":"moderate"}}}'::jsonb,
 '{"disclaimer":"General educational information, not a medical prescription.","forms":[{"form":"Flower powder","range_min":"1g","range_max":"3g","unit":"per day","notes":"With honey or warm water"}],"long_term_safety_data":false}'::jsonb,
 '{"common":["Mild GI warmth"],"uncommon":["Constipation"],"rare":["Allergic reaction"]}'::jsonb,
 '[]'::jsonb, '[]'::jsonb,
 'herbs/nagkesar.md');


-- ============================
-- HERB-CONDITION RISK MAPPINGS (40 new herbs)
-- ============================

-- Neem
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_neem', 'cond_pregnancy', 'red', 'Avoid', 'Anti-implantation, abortifacient properties well-documented in animal studies.', true),
('herb_neem', 'cond_trying_to_conceive', 'red', 'Avoid', 'Anti-fertility effects — spermicidal in males, anti-implantation in females.', true),
('herb_neem', 'cond_autoimmune', 'yellow', 'Use With Caution', 'Immunostimulatory properties may worsen autoimmune conditions.', false),
('herb_neem', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood sugar lowering. Additive with antidiabetic drugs.', false),
('herb_neem', 'cond_liver_disease', 'yellow', 'Use With Caution', 'Hepatotoxicity reported with oil and high doses.', false);

-- Guggulu
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_guggulu', 'cond_pregnancy', 'red', 'Avoid', 'Uterine stimulant. May cause miscarriage.', true),
('herb_guggulu', 'cond_hyperthyroid', 'red', 'Avoid', 'Thyroid-stimulating effects aggravate hyperthyroidism.', true),
('herb_guggulu', 'cond_bleeding_disorder', 'yellow', 'Use With Caution', 'Antiplatelet activity.', false),
('herb_guggulu', 'cond_liver_disease', 'yellow', 'Use With Caution', 'Hepatotoxicity reported.', false),
('herb_guggulu', 'cond_hypothyroid', 'yellow', 'Use With Caution', 'May increase thyroid hormone levels. Monitor TSH.', false);

-- Moringa
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_moringa', 'cond_pregnancy', 'red', 'Avoid root/bark, Leaves caution', 'Root and bark have abortifacient alkaloids. Leaves safer but limited safety data.', true),
('herb_moringa', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood sugar lowering.', false),
('herb_moringa', 'cond_hypothyroid', 'yellow', 'Use With Caution', 'May decrease thyroid hormone levels.', false);

-- Gokshura
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_gokshura', 'cond_pregnancy', 'red', 'Avoid', 'Insufficient safety data. Steroidal saponins.', true),
('herb_gokshura', 'cond_kidney_disease_moderate_severe', 'yellow', 'Use With Caution', 'Diuretic effect may stress kidneys.', false),
('herb_gokshura', 'cond_breast_cancer_history', 'yellow', 'Use With Caution', 'Potential hormonal activity.', false);

-- Punarnava
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_punarnava', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Limited safety data.', false),
('herb_punarnava', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood sugar lowering.', false);

-- Shilajit
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_shilajit', 'cond_pregnancy', 'red', 'Avoid', 'Heavy metal contamination risk. No safety data in pregnancy.', true),
('herb_shilajit', 'cond_kidney_disease_moderate_severe', 'yellow', 'Use With Caution', 'Mineral content may stress kidneys.', false),
('herb_shilajit', 'cond_iron_overload', 'yellow', 'Use With Caution', 'Contains iron. May worsen overload.', false);

-- Kutki
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_kutki', 'cond_pregnancy', 'red', 'Avoid', 'Insufficient safety data.', true),
('herb_kutki', 'cond_autoimmune', 'yellow', 'Use With Caution', 'Immunostimulatory. May worsen autoimmune.', false);

-- Bhringaraj
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_bhringaraj', 'cond_pregnancy', 'red', 'Avoid', 'Insufficient safety data.', true),
('herb_bhringaraj', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood sugar lowering.', false);

-- Shankhapushpi
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_shankhapushpi', 'cond_pregnancy', 'red', 'Avoid', 'Uterine stimulant. Insufficient safety data.', true),
('herb_shankhapushpi', 'cond_epilepsy', 'yellow', 'Caution — Neurologist Required', 'CNS depressant may interact with antiepileptics.', false);

-- Vacha
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_vacha', 'cond_pregnancy', 'red', 'Avoid', 'Potential teratogen (beta-asarone). Emmenagogue.', true),
('herb_vacha', 'cond_liver_disease', 'red', 'Avoid', 'Hepatotoxicity risk from beta-asarone.', true),
('herb_vacha', 'cond_epilepsy', 'yellow', 'Use With Caution', 'CNS effects may interact with antiepileptics.', false);

-- Pippali
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_pippali', 'cond_pregnancy', 'red', 'Avoid', 'Tikshna ushna — uterine stimulation risk.', true),
('herb_pippali', 'cond_bleeding_disorder', 'yellow', 'Use With Caution', 'May affect platelet function.', false),
('herb_pippali', 'cond_gerd', 'yellow', 'Use With Caution', 'Pungent herb may worsen reflux.', false);

-- Maricha (Black Pepper)
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_maricha', 'cond_pregnancy', 'green', 'Safe at culinary doses', 'Normal cooking amounts safe. Supplement doses unvalidated.', false),
('herb_maricha', 'cond_peptic_ulcer', 'yellow', 'Use With Caution', 'GI irritant. May worsen ulcers at high doses.', false),
('herb_maricha', 'cond_gerd', 'yellow', 'Use With Caution', 'Pungent. May worsen reflux.', false);

-- Shunthi (Ginger)
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_shunthi', 'cond_pregnancy', 'green', 'Safe at culinary/low doses', 'RCTs support safety for nausea up to 1g/day. Higher doses unvalidated.', false),
('herb_shunthi', 'cond_bleeding_disorder', 'yellow', 'Use With Caution', 'Antiplatelet activity at supplement doses.', false),
('herb_shunthi', 'cond_gerd', 'yellow', 'Use With Caution', 'May worsen reflux in some individuals.', false);

-- Dalchini (Cinnamon)
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_dalchini', 'cond_pregnancy', 'green', 'Safe at culinary doses', 'Cooking amounts safe. Supplement doses: caution.', false),
('herb_dalchini', 'cond_liver_disease', 'yellow', 'Use With Caution', 'Cassia variety has high coumarin — hepatotoxic.', false),
('herb_dalchini', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood sugar lowering.', false);

-- Methi (Fenugreek)
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_methi', 'cond_pregnancy', 'red', 'Avoid supplement doses', 'Uterine stimulant. Traditional use of small amounts, but supplement doses risky.', true),
('herb_methi', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Blood sugar lowering. Multiple RCTs.', false),
('herb_methi', 'cond_bleeding_disorder', 'yellow', 'Use With Caution', 'Coumarin content may increase bleeding.', false);

-- Kalmegh
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_kalmegh', 'cond_pregnancy', 'red', 'Avoid', 'Abortifacient properties in animal models.', true),
('herb_kalmegh', 'cond_trying_to_conceive', 'yellow', 'Use With Caution', 'Anti-fertility effects in animal studies.', false),
('herb_kalmegh', 'cond_autoimmune', 'yellow', 'Use With Caution', 'Immunostimulatory. May worsen autoimmune.', false);

-- Manjistha
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_manjistha', 'cond_pregnancy', 'red', 'Avoid', 'Uterine stimulant properties.', true),
('herb_manjistha', 'cond_bleeding_disorder', 'yellow', 'Use With Caution', 'May affect platelet function.', false);

-- Chitrak
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_chitrak', 'cond_pregnancy', 'red', 'Avoid', 'Strong abortifacient. Plumbagin is embryotoxic.', true),
('herb_chitrak', 'cond_peptic_ulcer', 'red', 'Avoid', 'Highly irritant to GI mucosa.', true),
('herb_chitrak', 'cond_bleeding_disorder', 'yellow', 'Use With Caution', 'GI irritation risk.', false);

-- Bala
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_bala', 'cond_pregnancy', 'red', 'Avoid', 'Contains ephedrine alkaloids.', true),
('herb_bala', 'cond_hypertension', 'red', 'Avoid', 'Ephedrine raises blood pressure.', true),
('herb_bala', 'cond_arrhythmia', 'red', 'Avoid', 'Ephedrine — cardiac stimulant. Arrhythmia risk.', true),
('herb_bala', 'cond_heart_failure', 'red', 'Avoid', 'Cardiac stimulant effects dangerous in heart failure.', true);

-- Jatamansi
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_jatamansi', 'cond_pregnancy', 'red', 'Avoid', 'Insufficient safety data. CNS depressant.', true),
('herb_jatamansi', 'cond_epilepsy', 'yellow', 'Use With Caution', 'May interact with antiepileptics.', false);

-- Kumari (Aloe)
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_kumari', 'cond_pregnancy', 'red', 'Avoid oral latex', 'Anthraquinone laxatives can trigger uterine contractions. Gel topical is safe.', true),
('herb_kumari', 'cond_ibs_diarrhea', 'red', 'Avoid', 'Laxative effect worsens diarrhea-predominant IBS.', true),
('herb_kumari', 'cond_kidney_disease_moderate_severe', 'yellow', 'Use With Caution', 'Chronic latex use associated with kidney damage.', false);

-- Senna
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_senna', 'cond_pregnancy', 'red', 'Avoid', 'Stimulant laxative. Uterine contractions risk.', true),
('herb_senna', 'cond_ibs_diarrhea', 'red', 'Avoid', 'Stimulant laxative worsens diarrhea.', true),
('herb_senna', 'cond_kidney_disease_moderate_severe', 'yellow', 'Use With Caution', 'Electrolyte depletion stresses kidneys.', false),
('herb_senna', 'cond_heart_failure', 'yellow', 'Use With Caution', 'Chronic use causes hypokalemia — cardiac risk.', false);

-- Isabgol
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_isabgol', 'cond_pregnancy', 'green', 'Generally Safe', 'Bulk laxative. Safe when taken with adequate water.', false),
('herb_isabgol', 'cond_diabetes_type_2', 'yellow', 'Use With Caution', 'Delays glucose absorption. May affect drug absorption.', false);

-- Kapikacchu
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_kapikacchu', 'cond_pregnancy', 'red', 'Avoid', 'L-DOPA content. No safety data.', true),
('herb_kapikacchu', 'cond_arrhythmia', 'yellow', 'Use With Caution', 'L-DOPA can affect cardiac rhythm.', false),
('herb_kapikacchu', 'cond_epilepsy', 'yellow', 'Use With Caution', 'Dopaminergic effects may interact with antiepileptics.', false);

-- Remaining herbs with basic pregnancy mapping
INSERT INTO herb_condition_risks (herb_id, condition_id, risk_code, risk_label, explanation, overrides_all) VALUES
('herb_vidanga', 'cond_pregnancy', 'red', 'Avoid', 'Anti-fertility effects. Emmenagogue.', true),
('herb_tagar', 'cond_pregnancy', 'red', 'Avoid', 'CNS depressant. No safety data.', true),
('herb_safed_musli', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Limited data. Traditional use considered safe.', false),
('herb_rasna', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Limited safety data.', false),
('herb_lodhra', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Limited safety data.', false),
('herb_nagkesar', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Limited safety data.', false),
('herb_musta', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Limited safety data.', false),
('herb_haritaki', 'cond_pregnancy', 'red', 'Avoid', 'Uterine stimulant. Apana Vayu action.', true),
('herb_bibhitaki', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Limited safety data. Part of Triphala.', false),
('herb_sariva', 'cond_pregnancy', 'green', 'Generally Safe', 'Traditional use considered safe. Sheeta virya.', false),
('herb_chirata', 'cond_pregnancy', 'red', 'Avoid', 'Bitter herb may cause uterine contractions.', true),
('herb_ajwain', 'cond_pregnancy', 'green', 'Safe at culinary doses', 'Normal cooking amounts safe.', false),
('herb_jeera', 'cond_pregnancy', 'green', 'Safe at culinary doses', 'Very safe at normal amounts.', false),
('herb_kalonji', 'cond_pregnancy', 'yellow', 'Use With Caution', 'Some animal data suggests uterine effects at high doses.', false),
('herb_elaichi', 'cond_pregnancy', 'green', 'Safe at culinary doses', 'Very safe.', false),
('herb_lavanga', 'cond_pregnancy', 'green', 'Safe at culinary doses', 'Normal amounts safe.', false);


-- ============================
-- HERB-MEDICATION INTERACTIONS (40 new herbs — key ones)
-- ============================

INSERT INTO herb_medication_interactions (herb_id, medication_id, severity, interaction_type, mechanism, clinical_action) VALUES
-- Neem
('herb_neem', 'med_antidiabetic_oral', 'moderate', 'pharmacological', 'Additive blood sugar lowering.', 'Monitor glucose.'),
('herb_neem', 'med_immunosuppressant', 'moderate_high', 'theoretical', 'Immunostimulatory. May oppose immunosuppression.', 'Inform physician.'),

-- Guggulu
('herb_guggulu', 'med_levothyroxine', 'moderate_high', 'pharmacological', 'Thyroid-stimulating effect. Potentiation risk.', 'Monitor TSH. Inform endocrinologist.'),
('herb_guggulu', 'med_warfarin', 'moderate', 'theoretical', 'May affect anticoagulation.', 'Monitor INR.'),
('herb_guggulu', 'med_statin', 'moderate', 'pharmacological', 'Additive lipid-lowering. May affect statin metabolism.', 'Monitor. Inform physician.'),

-- Moringa
('herb_moringa', 'med_antidiabetic_oral', 'moderate', 'pharmacological', 'Additive blood sugar lowering.', 'Monitor glucose.'),
('herb_moringa', 'med_levothyroxine', 'moderate', 'theoretical', 'May affect thyroid function.', 'Monitor TSH.'),

-- Shilajit
('herb_shilajit', 'med_antidiabetic_oral', 'moderate', 'pharmacological', 'Blood sugar lowering.', 'Monitor glucose.'),
('herb_shilajit', 'med_iron_supplement', 'low_moderate', 'pharmacological', 'Contains iron. Additive iron intake.', 'Monitor iron levels.'),

-- Methi (Fenugreek)
('herb_methi', 'med_antidiabetic_oral', 'moderate_high', 'pharmacological', 'Significant blood sugar lowering in multiple RCTs. Additive hypoglycemia risk.', 'Monitor glucose closely.'),
('herb_methi', 'med_insulin', 'moderate_high', 'pharmacological', 'Additive hypoglycemia with insulin.', 'Monitor glucose. Inform physician.'),
('herb_methi', 'med_warfarin', 'moderate', 'theoretical', 'Coumarin content may potentiate anticoagulation.', 'Monitor INR.'),

-- Kalmegh
('herb_kalmegh', 'med_immunosuppressant', 'moderate_high', 'theoretical', 'Immunostimulatory. Opposes immunosuppression.', 'Avoid in transplant. Inform physician.'),
('herb_kalmegh', 'med_antidiabetic_oral', 'moderate', 'pharmacological', 'Blood sugar lowering.', 'Monitor glucose.'),

-- Maricha (Piperine)
('herb_maricha', 'med_warfarin', 'moderate_high', 'pharmacological', 'Piperine inhibits CYP3A4/CYP2D6. Increases drug levels.', 'Monitor INR. Inform physician.'),
('herb_maricha', 'med_antiepileptic', 'moderate_high', 'pharmacological', 'CYP inhibition increases phenytoin/carbamazepine levels.', 'Inform neurologist.'),
('herb_maricha', 'med_ssri', 'moderate', 'pharmacological', 'CYP2D6 inhibition may increase SSRI levels.', 'Monitor for serotonergic side effects.'),

-- Shunthi (Ginger)
('herb_shunthi', 'med_warfarin', 'moderate', 'pharmacological', 'Antiplatelet activity. Additive bleeding risk.', 'Monitor INR.'),
('herb_shunthi', 'med_antidiabetic_oral', 'moderate', 'pharmacological', 'Blood sugar lowering.', 'Monitor glucose.'),

-- Dalchini (Cinnamon)
('herb_dalchini', 'med_antidiabetic_oral', 'moderate', 'pharmacological', 'Blood sugar lowering.', 'Monitor glucose.'),
('herb_dalchini', 'med_warfarin', 'moderate', 'pharmacological', 'Cassia cinnamon contains coumarin.', 'Monitor INR with Cassia variety.'),

-- Bala (Ephedrine)
('herb_bala', 'med_beta_blocker', 'high', 'pharmacological', 'Ephedrine opposes beta-blocker effects.', 'AVOID combination.'),
('herb_bala', 'med_ssri', 'moderate_high', 'pharmacological', 'Ephedrine + SSRI: hypertensive crisis risk.', 'AVOID combination.'),

-- Jatamansi
('herb_jatamansi', 'med_benzodiazepine', 'moderate', 'pharmacological', 'Additive sedation.', 'Monitor for excessive drowsiness.'),
('herb_jatamansi', 'med_ssri', 'moderate', 'theoretical', 'CNS depressant effects may compound.', 'Inform psychiatrist.'),

-- Tagar (Valerian)
('herb_tagar', 'med_benzodiazepine', 'moderate_high', 'pharmacological', 'Strong additive sedation. GABAergic.', 'AVOID combination without physician.'),
('herb_tagar', 'med_ssri', 'moderate', 'theoretical', 'Additive CNS depression.', 'Inform psychiatrist.'),

-- Kapikacchu (L-DOPA)
('herb_kapikacchu', 'med_ssri', 'moderate_high', 'pharmacological', 'L-DOPA + SSRI: serotonin syndrome risk.', 'Inform psychiatrist. Monitor.'),
('herb_kapikacchu', 'med_antipsychotic', 'high', 'pharmacological', 'L-DOPA directly opposes dopamine-blocking antipsychotics.', 'AVOID. Inform psychiatrist.'),

-- Kumari (Aloe)
('herb_kumari', 'med_diuretic_loop', 'moderate_high', 'pharmacological', 'Both cause potassium wasting. Hypokalemia risk.', 'AVOID. Monitor potassium.'),
('herb_kumari', 'med_digoxin', 'moderate_high', 'pharmacological', 'Hypokalemia potentiates digoxin toxicity.', 'AVOID combination.'),

-- Senna
('herb_senna', 'med_diuretic_loop', 'moderate_high', 'pharmacological', 'Compounded potassium wasting. Hypokalemia.', 'AVOID. Monitor potassium.'),
('herb_senna', 'med_digoxin', 'high', 'pharmacological', 'Hypokalemia potentiates digoxin toxicity. Potentially fatal.', 'AVOID combination.'),

-- Isabgol
('herb_isabgol', 'med_antidiabetic_oral', 'moderate', 'pharmacological', 'Delays drug absorption. May reduce effectiveness.', 'Take medications 1 hour before or 2 hours after.');


-- ============================
-- EVIDENCE CLAIMS (40 new herbs — key claims)
-- ============================

INSERT INTO evidence_claims (herb_id, claim_id, claim, evidence_grade, summary, mechanism, active_compounds, symptom_tags) VALUES
-- Neem
('herb_neem', 'neem_oral', 'Oral health (dental plaque/gingivitis)', 'B', 'Multiple RCTs show efficacy comparable to chlorhexidine.', 'Antimicrobial, anti-inflammatory', ARRAY['azadirachtin','nimbin'], ARRAY['general_wellness']),
('herb_neem', 'neem_skin', 'Skin conditions (acne, dermatitis)', 'C', 'Traditional use extensive. Limited controlled trials.', 'Antimicrobial, anti-inflammatory', ARRAY['azadirachtin','nimbidin'], ARRAY['skin_issues']),
('herb_neem', 'neem_glucose', 'Blood sugar regulation', 'C', 'Small animal studies. Limited human data.', 'Insulin sensitization (proposed)', ARRAY['nimbin'], ARRAY['blood_sugar_concern']),

-- Guggulu
('herb_guggulu', 'gugg_lipid', 'Cholesterol/lipid modulation', 'B', 'Several RCTs. Results mixed. Indian studies positive, Western studies less so.', 'FXR antagonism, thyroid stimulation', ARRAY['guggulsterones'], ARRAY['cholesterol_concern','heart_health']),
('herb_guggulu', 'gugg_arthritis', 'Anti-inflammatory (arthritis)', 'B-C', 'Small trials for osteoarthritis. Positive Ayurvedic trial data.', 'COX-2, LOX inhibition', ARRAY['guggulsterones'], ARRAY['joint_pain']),

-- Moringa
('herb_moringa', 'mor_nutrition', 'Nutritional supplementation', 'B', 'Well-documented nutrient profile. Used in malnutrition programs.', 'High protein, iron, calcium, vitamin A, C content', ARRAY['various_nutrients'], ARRAY['low_energy_fatigue','general_wellness']),
('herb_moringa', 'mor_glucose', 'Blood sugar regulation', 'C', 'Small trials. Modest effects.', 'Isothiocyanates, chlorogenic acid', ARRAY['isothiocyanates'], ARRAY['blood_sugar_concern']),

-- Gokshura
('herb_gokshura', 'gok_urinary', 'Urinary tract health', 'B-C', 'Small trials for BPH symptoms and urinary stones.', 'Diuretic, anti-lithogenic', ARRAY['protodioscin'], ARRAY['general_wellness']),
('herb_gokshura', 'gok_fertility', 'Male sexual health', 'C', 'Limited evidence. Marketing far exceeds evidence.', 'Hormonal (proposed, poorly proven)', ARRAY['protodioscin','saponins'], ARRAY['reproductive_health']),

-- Shilajit
('herb_shilajit', 'shil_fatigue', 'Anti-fatigue / energy', 'C', 'One small RCT. Traditional use extensive.', 'Mitochondrial CoQ10 enhancement', ARRAY['fulvic_acid','dibenzo_alpha_pyrones'], ARRAY['low_energy_fatigue']),
('herb_shilajit', 'shil_fertility', 'Male fertility', 'C', 'One small RCT showed sperm count increase.', 'Antioxidant, testosterone modulation', ARRAY['fulvic_acid'], ARRAY['reproductive_health']),

-- Methi (Fenugreek)
('herb_methi', 'methi_glucose', 'Blood sugar regulation', 'B', 'Multiple RCTs in T2DM. 25-30% fasting glucose reduction in some trials.', 'Galactomannan fiber, 4-hydroxyisoleucine', ARRAY['4_hydroxyisoleucine','galactomannan'], ARRAY['blood_sugar_concern']),
('herb_methi', 'methi_galacto', 'Galactogogue (breast milk)', 'B-C', 'Small trials positive. Traditional use widespread.', 'Phytoestrogenic, hormonal modulation', ARRAY['diosgenin'], ARRAY['reproductive_health']),
('herb_methi', 'methi_lipid', 'Cholesterol modulation', 'B-C', 'Small trials show LDL reduction.', 'Fiber binding, saponin effects', ARRAY['galactomannan','saponins'], ARRAY['cholesterol_concern']),

-- Kalmegh
('herb_kalmegh', 'kalm_cold', 'Common cold symptom relief', 'B', 'Several RCTs (Kan Jang product). Reduces cold duration and severity.', 'Immunostimulatory, anti-inflammatory', ARRAY['andrographolide'], ARRAY['respiratory_cold_cough','immunity_general']),
('herb_kalmegh', 'kalm_liver', 'Hepatoprotection', 'C', 'Animal studies robust. Limited human data.', 'Antioxidant, anti-inflammatory', ARRAY['andrographolide'], ARRAY['general_wellness']),

-- Shankhapushpi
('herb_shankhapushpi', 'shankh_memory', 'Memory and cognitive function', 'C', 'Very limited human studies. Animal data supportive.', 'Cholinergic, GABAergic', ARRAY['shankhapushpine','convolamine'], ARRAY['memory_concentration']),
('herb_shankhapushpi', 'shankh_anxiety', 'Anxiolytic', 'C', 'Traditional use extensive. Few controlled trials.', 'GABAergic modulation', ARRAY['shankhapushpine'], ARRAY['stress_anxiety']),

-- Jatamansi
('herb_jatamansi', 'jata_sleep', 'Sleep improvement', 'C', 'Traditional use extensive. Very limited clinical trials.', 'GABAergic, serotonergic', ARRAY['jatamansone'], ARRAY['sleep_issues']),
('herb_jatamansi', 'jata_anxiety', 'Anxiety reduction', 'C-D', 'Animal data supportive. No human RCTs.', 'CNS depressant, neuroprotective', ARRAY['jatamansone'], ARRAY['stress_anxiety']),

-- Tagar (Valerian)
('herb_tagar', 'tagar_sleep', 'Sleep improvement', 'B', 'Multiple RCTs (mostly V. officinalis). Indian species less studied.', 'GABAergic (valerenic acid)', ARRAY['valerenic_acid','iridoids'], ARRAY['sleep_issues']),
('herb_tagar', 'tagar_anxiety', 'Anxiety reduction', 'B-C', 'Some RCTs positive.', 'GABAergic modulation', ARRAY['valerenic_acid'], ARRAY['stress_anxiety']),

-- Kapikacchu
('herb_kapikacchu', 'kap_fertility', 'Male fertility (infertile men)', 'B', 'Several small RCTs show improved sperm parameters.', 'L-DOPA prolactin regulation, antioxidant', ARRAY['L_DOPA'], ARRAY['reproductive_health']),
('herb_kapikacchu', 'kap_parkinson', 'Parkinson disease (adjunct)', 'C', 'Small studies show comparable to levodopa. Never self-medicate.', 'Natural L-DOPA source', ARRAY['L_DOPA'], ARRAY['general_wellness']),

-- Isabgol
('herb_isabgol', 'isab_constip', 'Constipation relief', 'A', 'Well-established. FDA-approved fiber laxative.', 'Bulk-forming, water absorption', ARRAY['mucilage','hemicellulose'], ARRAY['constipation','digestive_issues']),
('herb_isabgol', 'isab_lipid', 'Cholesterol reduction', 'A', 'FDA-approved heart health claim. Multiple RCTs.', 'Bile acid binding', ARRAY['soluble_fiber'], ARRAY['cholesterol_concern','heart_health']),
('herb_isabgol', 'isab_glucose', 'Blood sugar regulation', 'B', 'Delays glucose absorption. Multiple trials.', 'Gel-forming fiber delays absorption', ARRAY['soluble_fiber'], ARRAY['blood_sugar_concern']),

-- Kalonji (Black Seed)
('herb_kalonji', 'kalon_glucose', 'Blood sugar regulation', 'B', 'Multiple small RCTs. Modest fasting glucose reduction.', 'Thymoquinone insulin sensitization', ARRAY['thymoquinone'], ARRAY['blood_sugar_concern']),
('herb_kalonji', 'kalon_lipid', 'Cholesterol modulation', 'B-C', 'Small trials. Mixed results.', 'Antioxidant, lipid modulation', ARRAY['thymoquinone'], ARRAY['cholesterol_concern']),

-- Bhringaraj
('herb_bhringaraj', 'bhring_hair', 'Hair growth / health', 'C-D', 'Widespread traditional use. No quality human RCTs.', 'Wedelolactone (proposed)', ARRAY['wedelolactone','ecliptine'], ARRAY['hair_issues']),
('herb_bhringaraj', 'bhring_liver', 'Hepatoprotection', 'C', 'Animal data strong. Human trials lacking.', 'Wedelolactone hepatoprotective', ARRAY['wedelolactone'], ARRAY['general_wellness']),

-- Kutki
('herb_kutki', 'kutki_liver', 'Hepatoprotection', 'B-C', 'Small clinical trials in hepatitis. Historical use for liver.', 'Picroside antioxidant, choleretic', ARRAY['picroside_I','picroside_II','kutkin'], ARRAY['general_wellness']),

-- Manjistha
('herb_manjistha', 'manj_skin', 'Skin health (complexion, acne)', 'C', 'Traditional blood purifier. Limited clinical trials.', 'Antioxidant, anti-inflammatory', ARRAY['rubiadin','purpurin'], ARRAY['skin_issues']),

-- Senna
('herb_senna', 'senna_constip', 'Constipation relief', 'A', 'FDA-approved stimulant laxative. Well-established efficacy.', 'Anthraquinone stimulant laxative', ARRAY['sennosides'], ARRAY['constipation']),

-- Haritaki
('herb_haritaki', 'hari_constip', 'Mild laxative / digestive', 'B', 'Traditional use validated. Small trials.', 'Prokinetic, mild laxative', ARRAY['chebulagic_acid','gallic_acid'], ARRAY['constipation','digestive_issues']),
('herb_haritaki', 'hari_oral', 'Oral health', 'B-C', 'Small trials positive.', 'Antimicrobial, astringent', ARRAY['tannins'], ARRAY['general_wellness']);
