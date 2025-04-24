export const targetChannels = {
  yehuda: {
    active: false,
    channels: [
      { name: "HebMix", area: "חברון" },
      { name: "vipdahrya", area: "דאהריה" },
      { name: "khalelnews", area: "חלחול" },
      { name: "aroubcamb", area: "ערב אל-כמב" },
      { name: "aljanoop48", area: "אל-ג'נוב" },
      { name: "doura2000", area: "דורה" },
      { name: "DuraCity", area: "דורה" },
      { name: "From_hebron", area: "חברון" },
      { name: "al_fawwar", area: "אל-פוואר" },
      { name: "IdnaNews0", area: "עידנא" },
      { name: "dahraih", area: "דאהריה" },
      { name: "HebronNewss", area: "חברון" },
      { name: "alsamou_alhadth", area: "אל-סמוע" },
      { name: "From_hebron", area: "חברון" },
      { name: "saeare", area: "סעיר" },
      { name: "osint941bot", area: "בדיקות" },
    ],
  },
  etzion: {
    active: true,
    channels: [
      { name: "tuqualhadath", area: "תקוע" },
      { name: "Teqoua_Now", area: "תקוע" },
      { name: "bethlahem_alhadth", area: "בית לחם" },
      { name: "BethlehemCommunityCh", area: "בית לחם" },
      { name: "bethlehemnewss", area: "בית לחם" },
      { name: "Aidacamp67", area: "בית לחם" },
      { name: "KutlaBU", area: "בית לחם" },
      { name: "bethlahemnow", area: "בית לחם" },
      { name: "dheisheh_event19486", area: "דהיישה" },
      { name: "dheisheh_Hadath", area: "דהיישה" },
      { name: "dheisheh_event48", area: "דהיישה" },
      { name: "dheisheh_event194867", area: "דהיישה" },
      { name: "beitommar9", area: "בית אומר" },
      { name: "Hebron_Beit_Ommer", area: "בית אומר" },
      { name: "beitommer", area: "בית אומר" },
      { name: "bietommar", area: "בית אומר" },
      { name: "sgfxxc", area: "נחלין" },
      { name: "marahrabahnow", area: "מראח רבאח" },
      { name: "ahrarsurif", area: "צוריף" },
      { name: "Aidacamp48", area: "מ.פ אל עיידה" },
      { name: "halhul2024", area: "חלחול" },
      { name: "alawaelnewsagancy", area: "עיזריה" },
      { name: "baninaeim22", area: "בני נעים" },
      { name: "saeare", area: "סעיר שיוח" },
      { name: "S3EERR", area: "סעיר שיוח" },
    ],
  },
  menashe: {
    active: true,
    channels: [],
  },
  binyamin: {
    active: true,
    channels: [],
  },
};

export const toggleGroup = (groupName, active) => {
  if (targetChannels[groupName]) {
    targetChannels[groupName].active = active;
    return true;
  }
  return false;
};

export const isGroupActive = (groupName) => {
  return targetChannels[groupName]?.active ?? false;
};
