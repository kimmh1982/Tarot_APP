import { useState } from 'react'; // useRef 추가 (애니메이션 값 관리용)
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// 화면 크기 상수
const { width, height } = Dimensions.get('window');

// [추가] 카드 뒷면 이미지 상수화
const CARD_BACK_IMAGE = require('./assets/images/back.jpg');

// [참고] 캘틱 크로스 위치 데이터 (App 밖으로 빼서 렌더링 부하 감소)
const CELTIC_POSITIONS = [
  { top: '40%', left: '25%' }, { top: '40%', left: '25%', rotate: '90deg' },
  { top: '10%', left: '25%' }, { top: '70%', left: '25%' },
  { top: '40%', left: '5%' },  { top: '40%', left: '45%' },
  { top: '75%', left: '75%' }, { top: '53%', left: '75%' },
  { top: '31%', left: '75%' }, { top: '9%', left: '75%' },
];

// TAROT_DB와 CARD_IMAGES는 데이터량이 많으므로 
// 별도의 tarotData.js 파일에서 import 해오는 것을 강력 추천합니다.
// import { TAROT_DB, CARD_IMAGES } from './constants/tarotData';
const TAROT_DB = {
  major: [
    { id: 'm00', n: "0. The Fool (광대)", u: "자유, 새로운 시작", r: "무모함", du: "무한한 잠재력과 자유로운 영혼을 상징합니다.", dr: "충동적이고 무분별한 행동이 화를 부를 수 있습니다." },
    { id: 'm01', n: "1. The Magician (마법사)", u: "창조, 능력", r: "기만", du: "모든 가능성이 당신의 손안에 있습니다.", dr: "능력을 제대로 발휘하지 못하고 낭비하고 있습니다." },
    { id: 'm02', n: "2. The High Priestess (여교황)", u: "직관, 지혜", r: "편견", du: "침묵 속의 지혜와 직관에 귀를 기울이세요.", dr: "지나친 예민함으로 주변을 힘들게 할 수 있습니다." },
    { id: 'm03', n: "3. The Empress (여황제)", u: "풍요, 번영", r: "정체", du: "물질적 풍요와 정신적 안정을 동시에 누립니다.", dr: "창의성이 막히고 성장이 더딥니다." },
    { id: 'm04', n: "4. The Emperor (황제)", u: "권위, 질서", r: "독재", du: "강력한 리더십과 구조를 세우는 힘입니다.", dr: "고집을 꺾지 않아 주변과 갈등을 빚습니다." },
    { id: 'm05', n: "5. The Hierophant (교황)", u: "전통, 교육", r: "독선", du: "검증된 절차를 따르는 것이 유익합니다.", dr: "낡은 생각에 갇혀 변화를 거부하고 있습니다." },
    { id: 'm06', n: "6. The Lovers (연인)", u: "선택, 사랑", r: "갈등", du: "중요한 기로에서의 선택과 조화를 의미합니다.", dr: "우유부단함으로 기회를 놓치거나 불화가 생깁니다." },
    { id: 'm07', n: "7. The Chariot (전차)", u: "승리, 추진력", r: "성급함", du: "강한 의지로 어려움을 극복하고 전진합니다.", dr: "자만심이 지나쳐 방향을 잃고 헤매게 됩니다." },
    { id: 'm08', n: "8. Strength (힘)", u: "인내, 용기", r: "무력함", du: "진정한 힘은 부드러움과 인내에서 나옵니다.", dr: "눈앞의 어려움에 압도당해 뒷걸음질 칩니다." },
    { id: 'm09', n: "9. The Hermit (은둔자)", u: "성찰, 고독", r: "고립", du: "깊은 사색을 통해 지혜를 얻는 시기입니다.", dr: "자신의 생각만 옳다는 아집에 빠질 위험이 있습니다." },
    { id: 'm10', n: "10. Wheel of Fortune (운명의 수레바퀴)", u: "변화, 행운", r: "정체", du: "거스를 수 없는 행운의 흐름이 찾아옵니다.", dr: "타이밍이 맞지 않아 계획이 틀어질 수 있습니다." },
    { id: 'm11', n: "11. Justice (정의)", u: "공정, 균형", r: "불공정", du: "정당하고 객관적인 판단을 내리는 시기입니다.", dr: "편견에 사로잡힌 결정을 내릴 위험이 있습니다." },
    { id: 'm12', n: "12. The Hanged Man (매달린 사람)", u: "희생, 통찰", r: "정체", du: "다른 각도에서 세상을 보는 인내가 필요합니다.", dr: "아무 보람 없는 고생만 하고 있습니다." },
    { id: 'm13', n: "13. Death (죽음)", u: "종결, 새 시작", r: "변화 거부", du: "과거를 정리해야 새로운 성장이 시작됩니다.", dr: "이미 끝난 일에 집착하여 고통을 연장합니다." },
    { id: 'm14', n: "14. Temperance (절제)", u: "조화, 소통", r: "불균형", du: "서로 다른 요소를 섞어 균형을 찾아냅니다.", dr: "생활의 절도가 무너지고 감정 기복이 심해집니다." },
    { id: 'm15', n: "15. The Devil (악마)", u: "속박, 집착", r: "해방", du: "물질적 욕망이나 집착에 사로잡혀 있습니다.", dr: "잘못된 관계나 나쁜 습관에서 벗어나기 시작합니다." },
    { id: 'm16', n: "16. The Tower (탑)", u: "붕괴, 재난", r: "위기 모면", du: "갑작스러운 충격은 진실을 마주하는 과정입니다.", dr: "큰 위기는 넘겼으나 근본 문제는 남아있습니다." },
    { id: 'm17', n: "17. The Star (별)", u: "희망, 치유", r: "비관", du: "상처 입은 마음이 치유되고 희망이 보입니다.", dr: "실현 가능성 없는 꿈에 매달려 실망합니다." },
    { id: 'm18', n: "18. The Moon (달)", u: "불안, 환상", r: "진실 공개", du: "모든 것이 불확실하고 혼란스러운 시기입니다.", dr: "혼란이 걷히고 사태의 본질이 드러납니다." },
    { id: 'm19', n: "19. The Sun (태양)", u: "성공, 활력", r: "과신", du: "모든 일이 밝은 방향으로 전개되어 성공합니다.", dr: "결과가 기대에 미치지 못하거나 지연됩니다." },
    { id: 'm20', n: "20. Judgement (심판)", u: "부활, 보상", r: "자책", du: "지난 노력이 드디어 보상을 받게 됩니다.", dr: "과거의 실수에 연연하여 결정을 내리지 못합니다." },
    { id: 'm21', n: "21. The World (세계)", u: "완성, 성취", r: "미완성", du: "성공적인 성취와 완성을 누리는 최고의 상태입니다.", dr: "거의 다 왔으나 마무리가 흐지부지됩니다." }
  ],
  minor: [
    // Wands
    { id: 'w01', n: "Ace of Wands", u: "열정적인 시작", r: "의욕 상실", du: "새로운 프로젝트나 아이디어의 탄생입니다.", dr: "시작은 거창하나 끝이 흐지부지됩니다." },
    { id: 'w02', n: "Two of Wands", u: "계획, 전망", r: "불안", du: "성공적인 첫걸음 이후 다음 단계를 구상합니다.", dr: "익숙한 곳에 안주하려다가 기회를 놓칩니다." },
    { id: 'w03', n: "Three of Wands", u: "확장, 성취", r: "지연", du: "노력의 결실이 보이기 시작합니다.", dr: "예상치 못한 방해로 계획이 틀어집니다." },
    { id: 'w04', n: "Four of Wands", u: "축하, 화합", r: "불안정", du: "행복한 시간과 안정적인 기반을 의미합니다.", dr: "사소한 오해로 팀워크가 깨집니다." },
    { id: 'w05', n: "Five of Wands", u: "경쟁, 갈등", r: "혼란", du: "치열하게 경쟁하며 더 나은 결과로 나아갑니다.", dr: "싸움이 감정싸움으로 번집니다." },
    { id: 'w06', n: "Six of Wands", u: "승리, 인정", r: "자만", du: "주변의 찬사를 받으며 명예를 얻습니다.", dr: "성공에 취해 오만한 태도를 보입니다." },
    { id: 'w07', n: "Seven of Wands", u: "방어, 투지", r: "압박감", du: "당신의 위치를 지키기 위해 싸워야 할 때입니다.", dr: "사면초가의 위기에 몰려 투지가 꺾입니다." },
    { id: 'w08', n: "Eight of Wands", u: "신속함", r: "정체", du: "일들이 급물살을 타기 시작합니다.", dr: "너무 서두르다가 일을 그르칩니다." },
    { id: 'w09', n: "Nine of Wands", u: "경계, 인내", r: "피로 누적", du: "마지막까지 경계를 늦추지 마세요.", dr: "체력이 고갈되어 더 이상 버틸 힘이 없습니다." },
    { id: 'w10', n: "Ten of Wands", u: "과도한 책임감", r: "짐 내려놓기", du: "혼자 너무 많은 짐을 짊어지고 있습니다.", dr: "한계에 도달해 결국 짐을 내려놓습니다." },
    { id: 'w11', n: "Page of Wands", u: "새로운 소식", r: "철부지", du: "경험은 부족하지만 열정적인 시작의 단계입니다.", dr: "아이디어만 많고 실천력이 제로입니다." },
    { id: 'w12', n: "Knight of Wands", u: "에너지, 충동", r: "성급함", du: "두려움 없이 목표를 향해 돌진하는 시기입니다.", dr: "앞뒤 안 가리고 덤비다가 사고를 칩니다." },
    { id: 'w13', n: "Queen of Wands", u: "자신감, 매력", r: "변덕", du: "독립적이고 열정적인 여성상을 상징합니다.", dr: "기분이 내키는 대로 행동하여 주변을 당황케 합니다." },
    { id: 'w14', n: "King of Wands", u: "리더십, 카리스마", r: "독재", du: "비전을 현실로 만드는 추진력이 있습니다.", dr: "자신의 뜻대로 되지 않으면 화를 냅니다." },

    // Cups
    { id: 'c01', n: "Ace of Cups", u: "사랑의 시작", r: "감정 억제", du: "새로운 사랑이나 우정이 싹트는 시기입니다.", dr: "마음이 메말라 사랑을 거부합니다." },
    { id: 'c02', n: "Two of Cups", u: "결합, 약속", r: "불화", du: "마음이 맞는 파트너를 만납니다.", dr: "서로 소통이 안 되어 갈등이 깊어집니다." },
    { id: 'c03', n: "Three of Cups", u: "축제, 치유", r: "과잉", du: "지인들과 기쁨을 나누는 시간입니다.", dr: "지나친 유흥으로 몸과 마음이 상합니다." },
    { id: 'c04', n: "Four of Cups", u: "권태, 불만족", r: "각성", du: "주어진 것에 감사하지 못하는 정체기입니다.", dr: "드디어 지루함의 늪에서 빠져나옵니다." },
    { id: 'c05', n: "Five of Cups", u: "상실감, 후회", r: "회복", du: "잃어버린 것에만 집착하는 상황입니다.", dr: "슬픔을 털어내고 다시 일어섭니다." },
    { id: 'c06', n: "Six of Cups", u: "향수, 추억", r: "미래 지향", du: "어린 시절이나 옛 인연을 그리워합니다.", dr: "과거의 기억에만 갇혀 현재를 살지 못합니다." },
    { id: 'c07', n: "Seven of Cups", u: "환상, 망상", r: "현실 직시", du: "실현 가능성 없는 망상에 빠져 있습니다.", dr: "허황된 꿈에서 깨어나 발을 땅에 붙입니다." },
    { id: 'c08', n: "Eight of Cups", u: "포기, 떠남", r: "미련", du: "더 높은 가치를 찾아 고독한 여행을 시작합니다.", dr: "떠나야 할 때 떠나지 못하고 주저앉습니다." },
    { id: 'c09', n: "Nine of Cups", u: "만족, 성취", r: "탐욕", du: "물질적 풍요와 안정을 동시에 누립니다.", dr: "가진 것에 안주하며 오만해집니다." },
    { id: 'c10', n: "Ten of Cups", u: "가족의 평화", r: "불화", du: "주변 사람들과 깊은 사랑을 나눕니다.", dr: "가족 구성원 간의 다툼이 발생합니다." },
    { id: 'c11', n: "Page of Cups", u: "감수성", r: "정서 불안", du: "새로운 사랑의 고백이 찾아올 수 있습니다.", dr: "감정 기복이 심해 주변을 피곤하게 합니다." },
    { id: 'c12', n: "Knight of Cups", u: "로맨틱한 제안", r: "사기꾼", du: "당신에게 설렘을 주는 인물이 나타납니다.", dr: "말만 번지르르하고 책임감이 없습니다." },
    { id: 'c13', n: "Queen of Cups", u: "자애로움, 직관", r: "예민함", du: "따뜻하고 포용력 있는 인물을 상징합니다.", dr: "감정이 소용돌이쳐 스스로를 통제하지 못합니다." },
    { id: 'c14', n: "King of Cups", u: "평정심, 관용", r: "감정 조종", du: "주변을 안정시키는 현명한 리더입니다.", dr: "타인의 감정을 교묘하게 이용합니다." },

    // Swords (검: s01 ~ s14)
    { id: 's01', n: "Ace of Swords", u: "명석한 판단", r: "혼란", du: "명확한 결단력으로 승리를 쟁취합니다.", dr: "판단력이 흐려져 잘못된 결정을 내립니다." },
    { id: 's02', n: "Two of Swords", u: "교착 상태", r: "결정", du: "두 가지 선택지 사이에서 고민 중입니다.", dr: "더 이상 피할 수 없는 선택의 순간입니다." },
    { id: 's03', n: "Three of Swords", u: "마음의 상처", r: "회복", du: "아픈 이별이나 배신을 겪을 수 있습니다.", dr: "상처가 아물기 시작하고 고통이 잦아듭니다." },
    { id: 's04', n: "Four of Swords", u: "휴식, 요양", r: "활동 시작", du: "몸과 마음을 추스르며 에너지를 비축하세요.", dr: "충분히 쉬었으니 다시 세상 밖으로 나옵니다." },
    { id: 's05', n: "Five of Swords", u: "비열한 승리", r: "후회", du: "이기고도 손해를 보는 허망한 상황입니다.", dr: "과거의 비겁했던 행동에 죄책감을 느낍니다." },
    { id: 's06', n: "Six of Swords", u: "이동, 회복", r: "곤경 지속", du: "점차 나은 방향으로 나아가는 여정입니다.", dr: "떠나고 싶어도 떠날 수 없는 형국입니다." },
    { id: 's07', n: "Seven of Swords", u: "기만, 임기응변", r: "들통남", du: "정면승부보다 꾀를 써서 모면하려 합니다.", dr: "숨겨왔던 비밀이나 행위가 드러납니다." },
    { id: 's08', n: "Eight of Swords", u: "진퇴양난", r: "해방", du: "부정적인 생각에 스스로를 가두고 있습니다.", dr: "자신을 억압하던 틀에서 벗어납니다." },
    { id: 's09', n: "Nine of Swords", u: "불안, 스트레스", r: "희망의 전조", du: "극심한 스트레스로 밤잠을 설치고 있습니다.", dr: "최악의 밤이 지나고 아침이 밝아옵니다." },
    { id: 's10', n: "Ten of Swords", u: "파멸, 종결", r: "재생", du: "더 이상 나빠질 수 없는 최악의 상황입니다.", dr: "바닥을 쳤으니 이제 올라갈 일만 남았습니다." },
    { id: 's11', n: "Page of Swords", u: "정보 탐색", r: "비방", du: "지적 호기심이 왕성하고 기민한 상태입니다.", dr: "근거 없는 소문을 퍼뜨려 분란을 일으킵니다." },
    { id: 's12', n: "Knight of Swords", u: "돌진, 추진력", r: "폭주", du: "생각이 나자마자 행동으로 옮기는 에너지입니다.", dr: "앞뒤 재지 않고 돌진하다가 낭떠러지로 떨어집니다." },
    { id: 's13', n: "Queen of Swords", u: "독립심, 지성", r: "냉혈한", du: "감정에 휘둘리지 않는 차가운 지성입니다.", dr: "지나치게 비판적이고 날카로운 상태입니다." },
    { id: 's14', n: "King of Swords", u: "전략가, 지적 권위", r: "잔인함", du: "공정하고 엄격한 기준을 가진 리더입니다.", dr: "자신의 지식을 권력 삼아 타인을 억압합니다." },

    // Pentacles (펜타클: p01 ~ p14)
    { id: 'p01', n: "Ace of Pentacles", u: "물질적 기회", r: "금전 손실", du: "사업, 취업 등 실질적인 이득의 시작입니다.", dr: "눈앞의 기회를 놓치거나 낭비하게 됩니다." },
    { id: 'p02', n: "Two of Pentacles", u: "조율, 유연함", r: "불균형", du: "변화 속에서도 유연하게 균형을 잡습니다.", dr: "감당할 수 없는 일을 벌여 혼란을 겪습니다." },
    { id: 'p03', n: "Three of Pentacles", u: "협력, 인정", r: "불화", du: "당신의 실력을 인정받아 성과를 거둡니다.", dr: "협동이 안 되어 일이 진척되지 않습니다." },
    { id: 'p04', n: "Four of Pentacles", u: "안정, 소유욕", r: "변화", du: "가진 것을 놓치지 않으려는 인색한 상태입니다.", dr: "붙잡고 있던 것을 강제로 놓게 됩니다." },
    { id: 'p05', n: "Five of Pentacles", u: "빈곤, 소외", r: "회복", du: "경제적으로 매우 힘든 역경의 시기입니다.", dr: "드디어 긴 고생이 끝나고 도움이 찾아옵니다." },
    { id: 'p06', n: "Six of Pentacles", u: "자선, 보상", r: "불평등", du: "노력한 만큼 합당한 보상을 받게 됩니다.", dr: "불공정한 배분으로 이득을 얻지 못합니다." },
    { id: 'p07', n: "Seven of Pentacles", u: "중간 점검", r: "노력 헛됨", du: "더 큰 이득을 위해 과정을 돌아봅니다.", dr: "공들인 탑이 무너지는 허무함을 느킵니다." },
    { id: 'p08', n: "Eight of Pentacles", u: "성실함, 숙련", r: "나태", du: "성실하게 몰두하여 기술이 발전합니다.", dr: "매너리즘에 빠져 게으름을 피우게 됩니다." },
    { id: 'p09', n: "Nine of Pentacles", u: "여여, 자립", r: "허영", du: "스스로 일궈낸 성공을 만끽하는 상태입니다.", dr: "겉만 화려하고 실속 없는 소비를 조심하세요." },
    { id: 'p10', n: "Ten of Pentacles", u: "유산, 풍요", r: "가정 불화", du: "안정적인 자산과 가족의 풍요를 상징합니다.", dr: "돈 때문에 가족 간에 다툼이 벌어집니다." },
    { id: 'p11', n: "Page of Pentacles", u: "기회, 성실", r: "비현실적", du: "현실적이고 성실하게 학습을 시작합니다.", dr: "실행은 하지 않고 결과만 바라는 상태입니다." },
    { id: 'p12', n: "Knight of Pentacles", u: "책임감, 꾸준함", r: "정체", du: "느리지만 확실하게 목표를 향해 나아갑니다.", dr: "변화에 둔감하여 기회를 놓치게 됩니다." },
    { id: 'p13', n: "Queen of Pentacles", u: "실무 능력", r: "의심", du: "주변을 풍요롭게 가꾸는 안목이 있습니다.", dr: "돈에 대한 집착으로 사람을 불신합니다." },
    { id: 'p14', n: "King of Pentacles", u: "성공, 자산가", r: "부패", du: "물질적 성공의 정점에 도달한 리더입니다.", dr: "돈이면 다 된다는 타락한 생각에 빠집니다." }
  ]
};

const CARD_IMAGES = {
  // Major
  'm00': require('./assets/images/m00.jpg'),
  'm01': require('./assets/images/m01.jpg'),
  'm02': require('./assets/images/m02.jpg'),
  'm03': require('./assets/images/m03.jpg'),
  'm04': require('./assets/images/m04.jpg'),
  'm05': require('./assets/images/m05.jpg'),
  'm06': require('./assets/images/m06.jpg'),
  'm07': require('./assets/images/m07.jpg'),
  'm08': require('./assets/images/m08.jpg'),
  'm09': require('./assets/images/m09.jpg'),
  'm10': require('./assets/images/m10.jpg'),
  'm11': require('./assets/images/m11.jpg'),
  'm12': require('./assets/images/m12.jpg'),
  'm13': require('./assets/images/m13.jpg'),
  'm14': require('./assets/images/m14.jpg'),
  'm15': require('./assets/images/m15.jpg'),
  'm16': require('./assets/images/m16.jpg'),
  'm17': require('./assets/images/m17.jpg'),
  'm18': require('./assets/images/m18.jpg'),
  'm19': require('./assets/images/m19.jpg'),
  'm20': require('./assets/images/m20.jpg'),
  'm21': require('./assets/images/m21.jpg'),

  // Wands
  'w01': require('./assets/images/w01.jpg'),
  'w02': require('./assets/images/w02.jpg'),
  'w03': require('./assets/images/w03.jpg'),
  'w04': require('./assets/images/w04.jpg'),
  'w05': require('./assets/images/w05.jpg'),
  'w06': require('./assets/images/w06.jpg'),
  'w07': require('./assets/images/w07.jpg'),
  'w08': require('./assets/images/w08.jpg'),
  'w09': require('./assets/images/w09.jpg'),
  'w10': require('./assets/images/w10.jpg'),
  'w11': require('./assets/images/w11.jpg'),
  'w12': require('./assets/images/w12.jpg'),
  'w13': require('./assets/images/w13.jpg'),
  'w14': require('./assets/images/w14.jpg'),

  // Cups
  'c01': require('./assets/images/c01.jpg'),
  'c02': require('./assets/images/c02.jpg'),
  'c03': require('./assets/images/c03.jpg'),
  'c04': require('./assets/images/c04.jpg'),
  'c05': require('./assets/images/c05.jpg'),
  'c06': require('./assets/images/c06.jpg'),
  'c07': require('./assets/images/c07.jpg'),
  'c08': require('./assets/images/c08.jpg'),
  'c09': require('./assets/images/c09.jpg'),
  'c10': require('./assets/images/c10.jpg'),
  'c11': require('./assets/images/c11.jpg'),
  'c12': require('./assets/images/c12.jpg'),
  'c13': require('./assets/images/c13.jpg'),
  'c14': require('./assets/images/c14.jpg'),

  // Swords
  's01': require('./assets/images/s01.jpg'),
  's02': require('./assets/images/s02.jpg'),
  's03': require('./assets/images/s03.jpg'),
  's04': require('./assets/images/s04.jpg'),
  's05': require('./assets/images/s05.jpg'),
  's06': require('./assets/images/s06.jpg'),
  's07': require('./assets/images/s07.jpg'),
  's08': require('./assets/images/s08.jpg'),
  's09': require('./assets/images/s09.jpg'),
  's10': require('./assets/images/s10.jpg'),
  's11': require('./assets/images/s11.jpg'),
  's12': require('./assets/images/s12.jpg'),
  's13': require('./assets/images/s13.jpg'),
  's14': require('./assets/images/s14.jpg'),

  // Pentacles
  'p01': require('./assets/images/p01.jpg'),
  'p02': require('./assets/images/p02.jpg'),
  'p03': require('./assets/images/p03.jpg'),
  'p04': require('./assets/images/p04.jpg'),
  'p05': require('./assets/images/p05.jpg'),
  'p06': require('./assets/images/p06.jpg'),
  'p07': require('./assets/images/p07.jpg'),
  'p08': require('./assets/images/p08.jpg'),
  'p09': require('./assets/images/p09.jpg'),
  'p10': require('./assets/images/p10.jpg'),
  'p11': require('./assets/images/p11.jpg'),
  'p12': require('./assets/images/p12.jpg'),
  'p13': require('./assets/images/p13.jpg'),
  'p14': require('./assets/images/p14.jpg')
};

const POSITIONS = [
  { t: "현재 상황" }, { t: "장애/도전" }, { t: "의식적 목표" }, { t: "무의식/기저" },
  { t: "과거의 영향" }, { t: "가까운 미래" }, { t: "나의 태도" }, { t: "주변 환경" },
  { t: "희망과 공포" }, { t: "최종 결과" }
];

export default function App() {
  // --- 1. 상태 및 애니메이션 정의 ---
  const [shuffleAnim] = useState(new Animated.Value(0));
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [gameState, setGameState] = useState('INTRO');
  const [question, setQuestion] = useState('');
  const [step, setStep] = useState(0);
  const [pickedCards, setPickedCards] = useState([]);
  const [showResult, setShowResult] = useState(false);

  // --- 2. 핵심 로직 함수 ---

  const runShuffleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shuffleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(shuffleAnim, { toValue: -1, duration: 200, useNativeDriver: true }),
      ]),
      { iterations: 5 }
    ).start();
  };

  const startTarot = () => {
    if (!question.trim()) {
      Alert.alert('질문을 입력해주세요', '예: "올해 연애운이 어떨까요?"');
      return;
    }
    setGameState('SHUFFLE');
    runShuffleAnimation();

    const allCards = [...TAROT_DB.major, ...TAROT_DB.minor];
    const selected = [...allCards]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map(c => ({ ...c, isRev: Math.random() < 0.5 }));

    setPickedCards(selected);
    setStep(0);

    setTimeout(() => {
      setGameState('SPREAD');
      shuffleAnim.setValue(0);
    }, 2000);
  };

  const getAIInterpretation = async () => {
    const apiKey = "AIzaSyAFtj6ty2xS6Af7hj9eunsPCosmGlOMQqA";
    const model = "gemini-1.5-flash"; // 모델명은 주기적으로 업데이트되니 확인 필요
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const cardsSummary = pickedCards.map((c, i) => 
      `${i + 1}. ${POSITIONS[i].t}: ${c.n} (${c.isRev ? '역방향' : '정방향'})`
    ).join('\n');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `다음은 타로 켈틱 크로스 리딩 결과입니다. 질문: "${question}"\n\n카드 결과:\n${cardsSummary}\n\n이 결과들을 종합하여 구체적이고 따뜻한 조언을 한국어로 작성해주세요.` }] }]
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "해석 생성 실패";
    } catch (e) {
      return "네트워크 오류 발생";
    }
  };

  const handleNext = async () => {
    if (step < 9) {
      setStep(step + 1);
    } else {
      setShowResult(true);
      setIsLoadingAI(true);
      const resultText = await getAIInterpretation();
      setAiInterpretation(resultText);
      setIsLoadingAI(false);
    }
  };

  const resetApp = () => {
    setGameState('INTRO');
    setStep(0);
    setShowResult(false);
    setQuestion('');
    setPickedCards([]);
    setAiInterpretation('');
  };

  const getCardPosition = (index) => {
    const positions = [
      { top: '40%', left: '25%' }, { top: '40%', left: '25%', rotate: '90deg' },
      { top: '10%', left: '25%' }, { top: '70%', left: '25%' },
      { top: '40%', left: '5%' },  { top: '40%', left: '45%' },
      { top: '75%', left: '75%' }, { top: '53%', left: '75%' },
      { top: '31%', left: '75%' }, { top: '9%', left: '75%' },
    ];
    const pos = positions[index];
    return {
      position: 'absolute',
      top: pos.top,
      left: pos.left,
      transform: [{ rotate: pos.rotate || '0deg' }],
      zIndex: index === 1 ? 2 : 1,
    };
  };

  // --- 3. 조건부 렌더링 ---

  if (gameState === 'INTRO') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.gradientBg}>
          <View style={styles.centered}>
            <Text style={styles.title}>✦ TAROT MASTER ✦</Text>
            <Text style={styles.subtitle}>당신의 운명을 읽어드립니다</Text>
            <TextInput
              style={styles.input}
              placeholder="고민이나 질문을 입력하세요..."
              placeholderTextColor="#64748b"
              value={question}
              onChangeText={setQuestion}
              multiline
            />
            <TouchableOpacity style={styles.btn} onPress={startTarot}>
              <Text style={styles.btnText}>🔮 운명의 카드 섞기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === 'SHUFFLE') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.gradientBg, styles.centered]}>
          <Animated.View style={{
            transform: [{
              translateX: shuffleAnim.interpolate({
                inputRange: [-1, 1],
                outputRange: [-30, 30]
              })
            }]
          }}>
            <Text style={{ fontSize: 100 }}>🎴</Text>
          </Animated.View>
          <Text style={styles.shufflingText}>운명의 카드를 섞는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

 if (gameState === 'SPREAD') {
    const currentCard = pickedCards[step];
    const cardSource = CARD_IMAGES[currentCard.id];

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.gradientBg}>
          <ScrollView contentContainerStyle={styles.spreadContainer}>
            {/* 1. 현재 카드 정보 영역 */}
            <View style={styles.cardDisplay}>
              <View style={[styles.bigCard, currentCard.isRev && styles.reversedCard]}>
                {cardSource ? (
                  <Image source={cardSource} style={styles.cardImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.cardEmoji}>🌙</Text>
                )}
                <Text style={styles.cardNumber}>{step + 1}</Text>
                {currentCard.isRev && (
                  <View style={styles.reversedBadge}>
                    <Text style={styles.reversedBadgeText}>역방향</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.positionTitle}>{step + 1}. {POSITIONS[step].t}</Text>
              <Text style={styles.cardName}>{currentCard.n}</Text>
              <Text style={styles.cardKeyword}>
                {currentCard.isRev ? `🔄 ${currentCard.r}` : `⬆️ ${currentCard.u}`}
              </Text>
              <Text style={styles.cardMeaning}>
                {currentCard.isRev ? currentCard.dr : currentCard.du}
              </Text>
            </View>

            {/* 2. 켈틱 크로스 배치도 영역 */}
            <Text style={[styles.subtitle, { marginBottom: 10 }]}>✦ 켈틱 크로스 배치도 ✦</Text>
            <View style={styles.celticBoard}>
              {pickedCards.map((card, index) => (
                <View key={index} style={[styles.miniCard, getCardPosition(index), step === index && styles.activeMiniCard]}>
                  <Image 
                    source={step >= index ? CARD_IMAGES[card.id] : require('./assets/images/back.jpg')} 
                    style={[styles.miniCardImage, step >= index && card.isRev && { transform: [{ rotate: '180deg' }] }]} 
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>{step < 9 ? '다음 카드 ➡️' : '✨ 최종 해석 보기'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 3. 결과 모달 */}
        <Modal visible={showResult} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🔮 리딩 결과</Text>
              <ScrollView style={styles.resultScroll} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.questionText}>질문: {question}</Text>
                {pickedCards.map((card, index) => (
                  <View key={index} style={styles.resultCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image source={CARD_IMAGES[card.id]} style={{ width: 35, height: 50, marginRight: 10, borderRadius: 4 }} />
                      <View>
                        <Text style={styles.resultPosition}>{index + 1}. {POSITIONS[index].t}</Text>
                        <Text style={styles.resultCardName}>{card.n}</Text>
                      </View>
                    </View>
                    <Text style={styles.resultMeaning}>{card.isRev ? card.dr : card.du}</Text>
                  </View>
                ))}
                <View style={styles.finalInterpretation}>
                  <Text style={styles.finalTitle}>💫 종합 해석</Text>
                  {isLoadingAI ? (
                    <ActivityIndicator size="large" color="#c084fc" style={{ margin: 20 }} />
                  ) : (
                    <Text style={styles.finalText}>{aiInterpretation}</Text>
                  )}
                </View>
              </ScrollView>
              <TouchableOpacity style={styles.closeBtn} onPress={resetApp}>
                <Text style={styles.closeBtnText}>처음으로</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  } // if (gameState === 'SPREAD') 닫기

  // 기본 로딩/예외 화면
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBg}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>데이터 처리 중...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  celticContainer: {
    width: width,
    height: height * 0.6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pos1: { position: 'absolute', top: '40%', zIndex: 1 },
  pos2: { position: 'absolute', top: '40%', transform: [{ rotate: '90deg' }], zIndex: 2 },
  column: { position: 'absolute', right: 10, height: '80%', justifyContent: 'space-between' },
  
  celticBoard: {
    width: '100%',
    height: 350,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    position: 'relative',
    marginBottom: 20,
  },
  miniCard: {
    width: width * 0.12,
    height: (width * 0.12) * 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.5)',
    overflow: 'hidden',
    position: 'absolute', // [추가] celticBoard 내 배치도를 위해 필수입니다.
  },
  miniCardImage: {
    width: '100%',
    height: '100%',
  },
  activeMiniCard: {
    borderColor: '#fff',
    borderWidth: 2,
    shadowColor: "#c084fc",
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },

  gradientBg: {
    flex: 1,
    backgroundColor: '#1e1b4b'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 36,
    color: '#c084fc',
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 2,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center'
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    padding: 20,
    borderRadius: 15,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#c084fc',
    textAlignVertical: 'top'
  },
  btn: {
    marginTop: 25,
    backgroundColor: '#c084fc',
    padding: 18,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center'
  },
  btnText: {
    color: '#1e1b4b',
    fontWeight: 'bold',
    fontSize: 16
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 20
  },
  shufflingText: {
    color: '#c084fc',
    fontSize: 18
  },
  spreadContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40
  },
  progressBar: {
    alignItems: 'center',
    marginBottom: 30
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600'
  },
  cardDisplay: {
    alignItems: 'center',
    marginBottom: 30
  },
  bigCard: {
    width: width * 0.5,
    height: width * 0.75,
    backgroundColor: '#312e81',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#c084fc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  reversedCard: {
    transform: [{ rotate: '180deg' }]
  },
  cardEmoji: {
    fontSize: 80,
    marginBottom: 10
  },
  cardNumber: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: '#c084fc',
    fontSize: 24,
    fontWeight: 'bold'
  },
  reversedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  reversedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  cardInfo: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#c084fc',
    marginBottom: 20
  },
  positionTitle: {
    color: '#c084fc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  cardName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  cardKeyword: {
    color: '#fbbf24',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center'
  },
  cardMeaning: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center'
  },
  nextBtn: {
    backgroundColor: '#c084fc',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  nextBtnText: {
    color: '#1e1b4b',
    fontWeight: 'bold',
    fontSize: 16
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    maxHeight: height * 0.85,
    width: '100%',
    display: 'flex', // [추가] 하단 버튼 고정을 위해 권장합니다.
  },
  resultScroll: {
    flex: 1, 
    marginTop: 10,
    marginBottom: 10,
  },

  finalInterpretation: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20, // [추가] 하단 여백 추가
    minHeight: 150,   // [수정] height 대신 minHeight를 써서 내용에 따라 늘어나게 하거나, 
                      // 박스 내 스크롤을 원하시면 고정 height를 유지하세요.
  },
  finalText: {
    color: '#FFFFFF', // [중요] 글자색을 반드시 흰색으로!
    fontSize: 16,
    lineHeight: 24,
  },
  closeBtn: {
    backgroundColor: '#c084fc',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',        // [추가] ScrollView 내용이 적어도 항상 맨 아래에 위치
  },
  closeBtnText: {
    color: '#1e1b4b',
    fontWeight: 'bold',
    fontSize: 15
  },
  errorText: {
    color: '#fff',
    fontSize: 16
  }
});