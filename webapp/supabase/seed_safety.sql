-- ============================================
-- SEED DATA: HERB-HERB INTERACTIONS
-- ============================================

-- Anticoagulant stacking (bleeding risk)
-- Haridra (Turmeric), Arjuna, Guggulu all have anticoagulant/antiplatelet properties
INSERT INTO herb_herb_interactions (herb_id_1, herb_id_2, risk_code, interaction_category, severity, mechanism, clinical_action, evidence_basis)
VALUES
('herb_arjuna', 'herb_haridra', 'yellow', 'anticoagulant_stacking', 'moderate_high',
 'Both herbs have antiplatelet/anticoagulant properties. Combined use increases bleeding risk, especially with concurrent blood-thinning medications.',
 'Avoid combining. If using both, monitor for signs of bleeding (bruising, bleeding gums, blood in stool). Do not use together with anticoagulant medications.',
 'pharmacological'),

('herb_arjuna', 'herb_guggulu', 'yellow', 'anticoagulant_stacking', 'moderate',
 'Both herbs may affect platelet aggregation and coagulation. Additive anticoagulant effect possible.',
 'Use with caution. Monitor for bleeding signs. Avoid if taking any blood-thinning medication.',
 'pharmacological'),

('herb_guggulu', 'herb_haridra', 'yellow', 'anticoagulant_stacking', 'moderate_high',
 'Curcumin (turmeric) inhibits platelet aggregation; guggulsterones affect coagulation pathways. Additive bleeding risk.',
 'Avoid combining, particularly if on anticoagulant or antiplatelet therapy. Monitor for unexplained bruising.',
 'pharmacological'),

-- Tulsi also has mild antiplatelet effects
('herb_haridra', 'herb_tulsi', 'yellow', 'anticoagulant_stacking', 'low_moderate',
 'Both have mild antiplatelet properties. Combined effect may be additive.',
 'Generally manageable. Avoid if on anticoagulant medications. Discontinue 2 weeks before surgery.',
 'pharmacological'),

-- CNS depression stacking
-- Ashwagandha, Jatamansi, Tagar, Brahmi all have sedative/anxiolytic properties
('herb_ashwagandha', 'herb_jatamansi', 'yellow', 'cns_depression_stacking', 'moderate',
 'Both herbs have GABAergic/sedative properties. Combined use may cause excessive drowsiness, reduced alertness.',
 'Avoid combining, especially at full doses. If using both, reduce doses and avoid operating machinery. Do not combine with sedative medications.',
 'pharmacological'),

('herb_ashwagandha', 'herb_tagar', 'yellow', 'cns_depression_stacking', 'moderate',
 'Ashwagandha (withanolides) and Tagar (valerenic acid) both have sedative effects via GABA modulation. Additive CNS depression.',
 'Avoid combining at full doses. If using both, reduce doses. Do not drive or operate machinery. Contraindicated with benzodiazepines.',
 'pharmacological'),

('herb_ashwagandha', 'herb_brahmi', 'yellow', 'cns_depression_stacking', 'low_moderate',
 'Both herbs have mild anxiolytic properties. Combined sedation risk is low but present, especially at higher doses.',
 'Can generally be used together at standard doses. Reduce dose if excessive drowsiness occurs.',
 'pharmacological'),

('herb_brahmi', 'herb_jatamansi', 'yellow', 'cns_depression_stacking', 'moderate',
 'Both are Medhya Rasayanas with sedative properties. Combined use may cause excessive drowsiness.',
 'Use at reduced doses if combining. Avoid with sedative medications.',
 'pharmacological'),

('herb_jatamansi', 'herb_tagar', 'red', 'cns_depression_stacking', 'high',
 'Both are potent sedatives (Jatamansi via nardostachyin, Tagar via valerenic acid). Combined use risk of significant CNS depression.',
 'Do NOT combine. Choose one. High risk of excessive sedation, especially with concurrent sedative/anxiolytic medications.',
 'pharmacological'),

('herb_brahmi', 'herb_tagar', 'yellow', 'cns_depression_stacking', 'moderate',
 'Both have sedative/anxiolytic effects. Additive CNS depression possible.',
 'Use with caution. Reduce doses if combining. Avoid with benzodiazepines or alcohol.',
 'pharmacological'),

-- Shankhapushpi also has sedative properties
('herb_ashwagandha', 'herb_shankhapushpi', 'yellow', 'cns_depression_stacking', 'low_moderate',
 'Both herbs have anxiolytic/calming properties. Mild additive sedation possible.',
 'Generally safe at standard doses. Reduce if drowsiness occurs.',
 'pharmacological'),

-- Hypoglycemia stacking
-- Guduchi, Methi, Haridra, Dalchini all lower blood sugar
('herb_guduchi', 'herb_methi', 'yellow', 'hypoglycemia_stacking', 'moderate',
 'Both herbs have hypoglycemic effects. Combined use with antidiabetic medications may cause dangerous hypoglycemia.',
 'Monitor blood sugar closely. Do not combine if on insulin or oral antidiabetics without medical supervision.',
 'pharmacological'),

('herb_guduchi', 'herb_haridra', 'yellow', 'hypoglycemia_stacking', 'moderate',
 'Both have demonstrated blood sugar lowering effects. Additive hypoglycemic risk, especially with diabetes medications.',
 'Monitor blood sugar. Use with caution in diabetic patients on medication.',
 'pharmacological'),

('herb_haridra', 'herb_methi', 'yellow', 'hypoglycemia_stacking', 'moderate',
 'Curcumin and fenugreek both lower blood glucose through different mechanisms. Additive effect on blood sugar reduction.',
 'Monitor blood sugar regularly. Avoid combining at high doses with antidiabetic medications.',
 'pharmacological'),

('herb_dalchini', 'herb_methi', 'yellow', 'hypoglycemia_stacking', 'moderate',
 'Both cinnamon and fenugreek lower blood glucose. Combined use increases hypoglycemia risk.',
 'Monitor blood sugar. Use lower doses when combining. Extra caution with diabetes medications.',
 'pharmacological'),

('herb_dalchini', 'herb_guduchi', 'yellow', 'hypoglycemia_stacking', 'low_moderate',
 'Both have mild to moderate blood sugar lowering effects. Additive hypoglycemic risk.',
 'Monitor blood sugar if combining with antidiabetic medications.',
 'pharmacological'),

-- Hepatotoxic stacking
-- Kutki, Kalmegh, Neem all have potential hepatotoxic effects at high doses
('herb_kalmegh', 'herb_kutki', 'yellow', 'hepatotoxic_stacking', 'moderate',
 'Both herbs are hepatically active. While individually hepatoprotective at standard doses, combined use may cause additive liver stress, especially at higher doses or with existing liver compromise.',
 'Avoid combining in patients with liver disease. Monitor liver function if used together. Do not combine with hepatotoxic medications (acetaminophen, statins).',
 'pharmacological'),

('herb_kutki', 'herb_neem', 'yellow', 'hepatotoxic_stacking', 'moderate',
 'Both herbs affect liver function. Combined high-dose use may increase liver enzyme elevation risk.',
 'Avoid in patients with liver disease. Monitor liver function. Do not use with hepatotoxic medications.',
 'pharmacological'),

('herb_kalmegh', 'herb_neem', 'yellow', 'hepatotoxic_stacking', 'moderate',
 'Andrographis (Kalmegh) and Neem both have hepatic effects. Combined use may stress liver, particularly in prolonged use.',
 'Avoid prolonged combined use. Monitor liver function. Contraindicated in liver disease patients.',
 'pharmacological'),

-- Potassium depletion / electrolyte disruption
-- Yashtimadhu (Licorice) depletes potassium. Dangerous with diuretic herbs.
('herb_punarnava', 'herb_yashtimadhu', 'yellow', 'electrolyte_disruption', 'moderate_high',
 'Yashtimadhu (glycyrrhizin) causes potassium depletion. Punarnava has diuretic properties. Combined use may cause dangerous hypokalemia.',
 'Avoid combining. If used together, monitor potassium levels. Contraindicated with loop diuretics or digoxin.',
 'pharmacological'),

('herb_senna', 'herb_yashtimadhu', 'red', 'electrolyte_disruption', 'high',
 'Senna (stimulant laxative) causes potassium loss through diarrhea. Yashtimadhu (glycyrrhizin) depletes potassium through mineralocorticoid effect. Combined use causes severe hypokalemia risk.',
 'Do NOT combine. Both deplete potassium through different mechanisms. Risk of cardiac arrhythmia from hypokalemia.',
 'pharmacological'),

-- Thyroid interference stacking
-- Ashwagandha and Guggulu both affect thyroid function
('herb_ashwagandha', 'herb_guggulu', 'yellow', 'thyroid_interference', 'moderate',
 'Ashwagandha may increase thyroid hormone (T3/T4) levels. Guggulsterones also stimulate thyroid activity. Combined use may cause excessive thyroid stimulation.',
 'Avoid combining in patients with hyperthyroidism or those on thyroid medications. Monitor thyroid function.',
 'pharmacological'),

-- Bioenhancer interactions
-- Pippali and Maricha (Black Pepper) alter CYP450 metabolism of other herbs
('herb_haridra', 'herb_pippali', 'yellow', 'bioenhancer_interaction', 'low_moderate',
 'Pippali (piperine) dramatically increases curcumin bioavailability (up to 2000%). While often used intentionally, this alters expected dose-response relationships.',
 'Be aware that Pippali significantly increases Turmeric absorption. Reduce turmeric dose if combining. May amplify both benefits and side effects.',
 'clinical'),

('herb_haridra', 'herb_maricha', 'yellow', 'bioenhancer_interaction', 'low_moderate',
 'Black pepper (piperine) increases curcumin bioavailability by up to 2000%. This is well-studied but alters expected dosing.',
 'Common traditional combination. Reduce turmeric dose if using with black pepper supplements. Monitor for GI discomfort.',
 'clinical'),

-- GI irritation stacking
-- Multiple hot/pungent herbs together may cause GI distress
('herb_chitrak', 'herb_pippali', 'yellow', 'gi_irritation_stacking', 'moderate',
 'Both are Ushna (heating) herbs with strong digestive stimulant effects. Combined use may cause excessive GI irritation, acidity, and mucosal damage.',
 'Avoid combining at high doses. Contraindicated in peptic ulcer, GERD, or hyperacidity conditions.',
 'pharmacological'),

('herb_chitrak', 'herb_maricha', 'yellow', 'gi_irritation_stacking', 'moderate',
 'Both are intensely pungent and heating. Combined use may cause gastric irritation and aggravate Pitta dosha.',
 'Use at reduced doses. Avoid in peptic ulcer, GERD, or inflammatory GI conditions.',
 'traditional');

-- ============================================
-- SEED DATA: AGE RESTRICTIONS
-- ============================================

-- Children under 6: most herbs are blocked or need extreme caution
-- Only a few gentle herbs are even potentially appropriate
INSERT INTO herb_age_restrictions (herb_id, age_group, restriction, explanation)
VALUES
-- Under 6: block potent herbs entirely
('herb_ashwagandha', 'child_under_6', 'blocked', 'No pediatric safety data for children under 6. Clinical trials only include adults.'),
('herb_shilajit', 'child_under_6', 'blocked', 'No pediatric safety data. Heavy metal contamination risk makes this unsafe for young children.'),
('herb_guggulu', 'child_under_6', 'blocked', 'No pediatric data. Potent lipid-modifying and thyroid-affecting herb. Not appropriate for young children.'),
('herb_kutki', 'child_under_6', 'blocked', 'No pediatric safety data. Hepatically active herb not studied in children.'),
('herb_kalmegh', 'child_under_6', 'blocked', 'Andrographis has no pediatric safety data. Bitter and potentially hepatotoxic.'),
('herb_senna', 'child_under_6', 'blocked', 'Stimulant laxative. Contraindicated in children under 6 due to electrolyte imbalance risk.'),
('herb_vacha', 'child_under_6', 'blocked', 'Contains beta-asarone which is neurotoxic. Absolutely contraindicated in young children.'),
('herb_chitrak', 'child_under_6', 'blocked', 'Highly caustic herb. Not safe for pediatric use.'),
('herb_vidanga', 'child_under_6', 'blocked', 'Anthelmintic herb with no pediatric safety data for this age group.'),
('herb_arjuna', 'child_under_6', 'blocked', 'Cardiovascular herb with no pediatric data. Not appropriate for children.'),
('herb_jatamansi', 'child_under_6', 'blocked', 'Potent sedative. No pediatric safety data. Risk of excessive CNS depression in children.'),
('herb_tagar', 'child_under_6', 'blocked', 'Valerian analogue. No pediatric data for children under 6.'),
('herb_pippali', 'child_under_6', 'blocked', 'CYP450 modifier (piperine). May alter metabolism of other medicines in unpredictable ways in children.'),
('herb_kapikacchu', 'child_under_6', 'blocked', 'Contains L-DOPA. No pediatric data. Neurotransmitter-active substances contraindicated in young children.'),
('herb_yashtimadhu', 'child_under_6', 'blocked', 'Glycyrrhizin causes pseudoaldosteronism. Children are more susceptible to electrolyte imbalances.'),
('herb_kalonji', 'child_under_6', 'blocked', 'Thymoquinone-containing herb with no pediatric data for this age group.'),
('herb_lodhra', 'child_under_6', 'blocked', 'Uterine-active herb with no pediatric data. Not appropriate for children.'),
('herb_safed_musli', 'child_under_6', 'blocked', 'Reproductive health herb. No pediatric indication or safety data.'),
('herb_nagkesar', 'child_under_6', 'blocked', 'No pediatric safety data available.'),

-- Children 6-12: caution for most, block the most potent
('herb_ashwagandha', 'child_6_12', 'caution', 'Limited pediatric data. Some studies in children 8+ at reduced doses. Consult pediatrician.'),
('herb_shilajit', 'child_6_12', 'blocked', 'No pediatric safety data. Heavy metal contamination risk.'),
('herb_guggulu', 'child_6_12', 'blocked', 'No pediatric data. Thyroid and lipid-modifying effects not studied in children.'),
('herb_kutki', 'child_6_12', 'caution', 'No pediatric dose established. Use only under practitioner supervision at reduced doses.'),
('herb_senna', 'child_6_12', 'caution', 'May be used short-term (1-2 days) at pediatric doses for constipation. Avoid prolonged use.'),
('herb_vacha', 'child_6_12', 'blocked', 'Beta-asarone content makes this unsafe for children.'),
('herb_jatamansi', 'child_6_12', 'blocked', 'Potent sedative. No pediatric data. Risk of excessive sedation.'),
('herb_tagar', 'child_6_12', 'caution', 'Some traditional use in older children. Use at half adult dose. Avoid with other sedatives.'),
('herb_kapikacchu', 'child_6_12', 'blocked', 'L-DOPA containing herb. Not appropriate for children.'),
('herb_yashtimadhu', 'child_6_12', 'caution', 'Short-term use at reduced doses may be acceptable. Avoid prolonged use (>2 weeks). Monitor for edema.'),
('herb_chitrak', 'child_6_12', 'blocked', 'Highly caustic herb. Not safe for pediatric use.'),
('herb_pippali', 'child_6_12', 'caution', 'CYP450 modifier. Use with caution and at reduced doses. Avoid combining with medications.'),
('herb_kalmegh', 'child_6_12', 'caution', 'Bitter herb with limited pediatric data. Short-term use at reduced doses only.'),
('herb_kalonji', 'child_6_12', 'caution', 'Limited pediatric data. Use at reduced doses under practitioner guidance.'),

-- Adolescents 13-17: mainly caution for reproductive/hormonal herbs
('herb_shilajit', 'adolescent_13_17', 'caution', 'Limited safety data in adolescents. May affect developing endocrine system. Use with practitioner guidance.'),
('herb_kapikacchu', 'adolescent_13_17', 'caution', 'L-DOPA content may affect developing neurotransmitter systems. Use only under medical supervision.'),
('herb_vacha', 'adolescent_13_17', 'blocked', 'Beta-asarone content. Contraindicated in all pediatric age groups.'),
('herb_safed_musli', 'adolescent_13_17', 'caution', 'Reproductive health herb. Not studied in adolescents. Use only under practitioner guidance.'),
('herb_senna', 'adolescent_13_17', 'caution', 'Short-term use only (max 1 week). Not for regular use in adolescents. Monitor for dependence.'),

-- Elderly (over 65): dose adjustments and caution for certain herbs
('herb_senna', 'elderly_over_65', 'caution', 'Increased risk of electrolyte imbalance, dehydration, and dependence in elderly. Use lowest effective dose, max 3 days.'),
('herb_shilajit', 'elderly_over_65', 'caution', 'Start at reduced dose. Monitor kidney function. Heavy metal contamination risk higher with impaired renal clearance.'),
('herb_vacha', 'elderly_over_65', 'blocked', 'Beta-asarone neurotoxicity risk. Elderly are more susceptible to neurotoxic effects.'),
('herb_jatamansi', 'elderly_over_65', 'caution', 'Sedative effects may be more pronounced. Increased fall risk. Start at reduced dose.'),
('herb_tagar', 'elderly_over_65', 'caution', 'Sedative effects more pronounced in elderly. Increased fall risk. Use at reduced dose. Avoid with other sedatives.'),
('herb_ashwagandha', 'elderly_over_65', 'dose_reduce', 'Start at lower dose (300mg vs 600mg). Sedative effect may be more pronounced. Monitor thyroid function.'),
('herb_guggulu', 'elderly_over_65', 'caution', 'Monitor thyroid function. May interact with many medications common in elderly. Start at reduced dose.'),
('herb_yashtimadhu', 'elderly_over_65', 'caution', 'Higher risk of hypokalemia and hypertension in elderly. Limit to 2 weeks. Monitor blood pressure and potassium.'),
('herb_chitrak', 'elderly_over_65', 'caution', 'GI irritation risk higher in elderly. Use at reduced doses. Avoid with GI conditions.'),
('herb_pippali', 'elderly_over_65', 'caution', 'CYP450 modification may be more significant in elderly with polypharmacy. Use with caution alongside medications.');
