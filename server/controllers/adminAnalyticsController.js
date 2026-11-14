const User = require("../models/User");

/**
 * GET /api/admin/analytics/crop-yield
 *
 * Computes real crop & yield analytics from the farmers' actual DB records.
 * No mock data, no random generation.
 *
 * Response shape:
 * {
 *   totalFarmers: number,
 *   completeFarmers: number,        // have crops[] AND totalLandArea
 *   incompleteFarmers: number,      // missing crops or land area
 *   totalLand: number,              // sum of totalLandArea for complete farmers
 *   cropDistribution: { [cropName]: areaAcres },
 *   stateBreakdown:   { [state]: areaAcres },
 *   districtBreakdown: { [district]: areaAcres },
 *   farmerList: [{ _id, fullName, phone, district, state, totalLandArea, crops[], incomplete }]
 * }
 */
exports.getCropYieldAnalytics = async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" })
      .select("fullName phone village district state totalLandArea crops")
      .sort({ fullName: 1 })
      .lean();

    const totalFarmers = farmers.length;

    const complete   = farmers.filter(f => f.crops?.length > 0 && f.totalLandArea > 0);
    const incomplete = farmers.filter(f => !f.crops?.length || !(f.totalLandArea > 0));

    const totalLand = complete.reduce((s, f) => s + (f.totalLandArea || 0), 0);

    // Crop distribution: sum area per crop name across all complete farmers
    const cropDistribution = {};
    for (const f of complete) {
      for (const c of (f.crops || [])) {
        const name = c.name?.trim() || 'Unknown Crop Field';
        cropDistribution[name] = (cropDistribution[name] || 0) + (c.area || 0);
      }
    }

    // State breakdown: sum totalLandArea per state (complete farmers only)
    const stateBreakdown = {};
    for (const f of complete) {
      const s = f.state || "Unknown";
      stateBreakdown[s] = (stateBreakdown[s] || 0) + (f.totalLandArea || 0);
    }

    // District breakdown: sum totalLandArea per district (complete farmers only)
    const districtBreakdown = {};
    for (const f of complete) {
      const d = f.district || "Unknown";
      districtBreakdown[d] = (districtBreakdown[d] || 0) + (f.totalLandArea || 0);
    }

    // Per-farmer list (all, honest incomplete flag)
    const farmerList = farmers.map(f => ({
      _id:          f._id,
      fullName:     f.fullName,
      phone:        f.phone,
      village:      f.village || null,
      district:     f.district || null,
      state:        f.state || null,
      totalLandArea: f.totalLandArea || 0,
      crops:        f.crops || [],
      incomplete:   !f.crops?.length || !(f.totalLandArea > 0),
    }));

    res.status(200).json({
      totalFarmers,
      completeFarmers:   complete.length,
      incompleteFarmers: incomplete.length,
      totalLand,
      cropDistribution,
      stateBreakdown,
      districtBreakdown,
      farmerList,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

