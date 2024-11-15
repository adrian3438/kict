// * WORLD - value
export const settings = {
  limit: {
    weightYMax: 0,
    weightYMin: -1.83, // 높이 무게
    scaleFactor: 1 // 가중치 증폭 팩터
  }
}

export const world = {};

export const actionValue = {
  nodeXs: [],          // 11개의 nodeX 값을 저장할 배열
  nodeYs: [],          // 각 nodeX 대응하는 Y 값을 저장할 배열
  nodeWeights: [],
  nodeMeshes: [],      // 각 nodeX 대응하는 plane mesh
  memberXs: [],        // 11개의 nodeX 값을 저장할 배열
  memberYs: [],        // 각 nodeX 대응하는 Y 값을 저장할 배열
  memberMeshes: [],    // 각 targetX에 대응하는 plane mesh
  markLabels: [],
  markBubbles: [],
  weightBubbles: [],
  shearBubbles: [],
  momentBubbles: [],
}

export const currentData = {
  id: 0,
  createDate: '',
  weights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  shears: [ -173, -173, -135, -135, -96.2, -96.2, -57.7, -57.7, -19.2, -19.2, 19.2, 19.2, 57.7, 57.7, 96.2, 96.2, 135, 135, 173, 173 ],
  moments: [ -1590, -722, -722, -48.1, -48.1, 433, 433, 722, 722, 818, 818, 722, 722, 433, 433, -481, -481, -722, -722, -1590 ],
  torsions: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
};