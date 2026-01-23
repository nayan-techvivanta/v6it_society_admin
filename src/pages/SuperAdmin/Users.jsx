import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../api/supabaseClient";
import {
  FaFilter,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaHome,
  FaCalendarAlt,
  FaSync,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCircle,
  FaWhatsapp,
  FaInfoCircle,
  FaDoorOpen,
  FaHashtag,
  FaLayerGroup,
} from "react-icons/fa";
import { Typography } from "@mui/material";
import { FilterList } from "@mui/icons-material";

export default function Users() {
  // States
  const [tenants, setTenants] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedSociety, setSelectedSociety] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFlat, setSelectedFlat] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTenant, setExpandedTenant] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all initial data
  const fetchAllData = useCallback(async () => {
    try {
      setLoadingFilters(true);
      setError(null);

      // Fetch societies
      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("id, name, city, is_active, is_delete")
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("name", { ascending: true });

      if (societiesError) throw societiesError;
      setSocieties(societiesData || []);

      // Fetch all buildings
      const { data: buildingsData, error: buildingsError } = await supabase
        .from("buildings")
        .select("id, name, society_id, building_type, is_active, is_delete")
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("name", { ascending: true });

      if (buildingsError) throw buildingsError;
      setBuildings(buildingsData || []);

      // Fetch all flats
      const { data: flatsData, error: flatsError } = await supabase
        .from("flats")
        .select(
          "id, flat_number, floor_number, bhk_type, occupancy_status, building_id, society_id",
        )
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("building_id", { ascending: true })
        .order("flat_number", { ascending: true });

      if (flatsError) throw flatsError;
      setFlats(flatsData || []);

      // Fetch all tenants
      await fetchAllTenants();
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Failed to load data");
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  // Filter buildings when society changes
  useEffect(() => {
    if (selectedSociety) {
      const societyBuildings = buildings.filter(
        (building) => building.society_id === selectedSociety,
      );
      setFilteredBuildings(societyBuildings);
    } else {
      setFilteredBuildings(buildings);
    }
  }, [selectedSociety, buildings]);

  // Filter flats when building changes
  useEffect(() => {
    if (selectedBuilding) {
      const buildingFlats = flats.filter(
        (flat) => flat.building_id === selectedBuilding,
      );
      setFilteredFlats(buildingFlats);
    } else if (selectedSociety) {
      const societyFlats = flats.filter(
        (flat) => flat.society_id === selectedSociety,
      );
      setFilteredFlats(societyFlats);
    } else {
      setFilteredFlats(flats);
    }
  }, [selectedBuilding, selectedSociety, flats]);

  // Fetch tenants when filters change
  useEffect(() => {
    fetchTenants();
  }, [selectedSociety, selectedBuilding, selectedFlat, selectedRoleType]);

  // Fetch all tenants (no filters)
  const fetchAllTenants = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          //   `
          //   *,
          //   buildings!inner(name, building_type),
          //   flats!left(
          //     id,
          //     flat_number,
          //     floor_number,
          //     bhk_type,
          //     occupancy_status
          //   )
          // `,
          "*",
        )
        .in("role_type", ["Tanent-O", "Tanent-M"])
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("name", { ascending: true })
        .order("created_at", { ascending: false });

      console.log("data of users------------------->", data);
      if (error) throw error;

      const formattedTenants = (data || []).map((tenant) => ({
        ...tenant,
        building_name: tenant.buildings?.name || "N/A",
        building_type: tenant.buildings?.building_type || "N/A",
        flat_number: tenant.flats?.flat_number || "N/A",
        floor_number: tenant.flats?.floor_number || "N/A",
        bhk_type: tenant.flats?.bhk_type || "N/A",
        occupancy_status: tenant.flats?.occupancy_status || "N/A",
        flat_id: tenant.flats?.id || null,
      }));

      setTenants(formattedTenants);
    } catch (err) {
      console.error("Error fetching all tenants:", err);
      setError("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tenants with filters
  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("users")
        .select(
          `
          *,
          buildings!inner(name, building_type),
          flats!left(
            id,
            flat_number,
            floor_number,
            bhk_type,
            occupancy_status
          )
        `,
        )
        .in("role_type", ["Tanent-O", "Tanent-M"])
        .eq("is_active", true)
        .eq("is_delete", false);

      if (selectedSociety) {
        query = query.eq("society_id", selectedSociety);
      }

      if (selectedBuilding) {
        query = query.eq("building_id", selectedBuilding);
      }

      if (selectedFlat) {
        query = query.eq("flat_id", selectedFlat);
      }

      if (selectedRoleType !== "all") {
        query = query.eq("role_type", selectedRoleType);
      }

      const { data, error } = await query
        .order("name", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedTenants = (data || []).map((tenant) => ({
        ...tenant,
        building_name: tenant.buildings?.name || "N/A",
        building_type: tenant.buildings?.building_type || "N/A",
        flat_number: tenant.flats?.flat_number || "N/A",
        floor_number: tenant.flats?.floor_number || "N/A",
        bhk_type: tenant.flats?.bhk_type || "N/A",
        occupancy_status: tenant.flats?.occupancy_status || "N/A",
        flat_id: tenant.flats?.id || null,
      }));

      setTenants(formattedTenants);
    } catch (err) {
      console.error("Error fetching tenants:", err);
      setError("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, [selectedSociety, selectedBuilding, selectedFlat, selectedRoleType]);

  // Sort and filter tenants
  const sortedTenants = useMemo(() => {
    let sortableTenants = [...tenants];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sortableTenants = sortableTenants.filter(
        (tenant) =>
          tenant.name?.toLowerCase().includes(query) ||
          tenant.email?.toLowerCase().includes(query) ||
          tenant.number?.includes(query) ||
          tenant.whatsapp_number?.includes(query) ||
          tenant.building_name?.toLowerCase().includes(query) ||
          tenant.flat_number?.toLowerCase().includes(query),
      );
    }

    // Sorting
    sortableTenants.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle special sorting for numeric fields
      if (sortConfig.key === "floor_number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortableTenants;
  }, [tenants, sortConfig, searchQuery]);

  // Utility functions
  const requestSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedSociety("");
    setSelectedBuilding("");
    setSelectedFlat("");
    setSelectedRoleType("all");
    setSearchQuery("");
    setShowFilters(false);
    fetchAllTenants();
  }, [fetchAllTenants]);

  const getRoleTypeColor = (roleType) => {
    switch (roleType) {
      case "Tanent-O":
        return "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border border-primary/30";
      case "Tanent-M":
        return "bg-gradient-to-r from-green-100 to-green-200 text-success border border-green-200";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-gradient-to-r from-success/20 to-success/30 text-success border border-success/30"
      : "bg-gradient-to-r from-reject/20 to-reject/30 text-reject border border-reject/30";
  };

  const getBuildingTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "residential":
        return "bg-green-100 text-green-800";
      case "commercial":
        return "bg-blue-100 text-blue-800";
      case "mixed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOccupancyColor = (status) => {
    switch (status?.toLowerCase()) {
      case "occupied":
        return "bg-green-100 text-green-800";
      case "vacant":
        return "bg-yellow-100 text-yellow-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBHKColor = (bhk) => {
    switch (bhk) {
      case "1BHK":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "2BHK":
        return "bg-green-50 text-green-700 border border-green-200";
      case "3BHK":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "4BHK":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <FaSort className="ml-2 w-4 h-4 text-hintText" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="ml-2 w-4 h-4 text-primary" />
    ) : (
      <FaSortDown className="ml-2 w-4 h-4 text-primary" />
    );
  };

  const stats = useMemo(() => {
    const total = tenants.length;
    const tenantO = tenants.filter((t) => t.role_type === "Tanent-O").length;
    const tenantM = tenants.filter((t) => t.role_type === "Tanent-M").length;
    const active = tenants.filter((t) => t.is_active).length;
    const occupiedFlats = [
      ...new Set(tenants.filter((t) => t.flat_id).map((t) => t.flat_id)),
    ].length;

    return { total, tenantO, tenantM, active, occupiedFlats };
  }, [tenants]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 md:p-8 font-roboto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Typography
                variant="h4"
                className="font-roboto font-bold text-primary mb-2"
              >
                Tenants Management
              </Typography>
              <Typography className="font-roboto text-gray-600">
                View and manage all tenants across societies with advanced
                filtering options
              </Typography>
            </div>
          </div>
        </div>
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-3">
              <FaTimesCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-bold text-red-900 text-lg">Load Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-auto px-4 py-2 bg-reject text-white rounded-xl hover:bg-red-800 font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white rounded-[8px] shadow-md border border-gray-100 p-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-lightBackground">
                <FilterList sx={{ color: "#6F0B14", fontSize: 20 }} />
              </div>
              <h2 className="text-xl font-semibold text-primary">
                Filters & Search
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-lightBackground text-primary rounded-lg hover:bg-opacity-80 transition-colors font-medium"
              >
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <FaSync />
                Reset
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hintText w-5 h-5" />
            <input
              type="text"
              placeholder="Search tenants by name, email, phone, building, or flat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            />
          </div>

          {/* Filter Controls */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              showFilters ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4  p-3 border-t border-gray-200">
              {/* Society Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Society
                </label>
                <select
                  value={selectedSociety}
                  onChange={(e) => {
                    setSelectedSociety(Number(e.target.value) || "");
                    setSelectedBuilding("");
                    setSelectedFlat("");
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  disabled={loadingFilters}
                >
                  <option value="">All Societies</option>
                  {societies.map((society) => (
                    <option key={society.id} value={society.id}>
                      {society.name} {society.city && `(${society.city})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Building Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building
                </label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => {
                    setSelectedBuilding(Number(e.target.value) || "");
                    setSelectedFlat("");
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  disabled={!selectedSociety && selectedSociety !== ""}
                >
                  <option value="">All Buildings</option>
                  {filteredBuildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name} ({building.building_type || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Flat Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flat
                </label>
                <select
                  value={selectedFlat}
                  onChange={(e) =>
                    setSelectedFlat(Number(e.target.value) || "")
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  disabled={filteredFlats.length === 0}
                >
                  <option value="">All Flats</option>
                  {filteredFlats.map((flat) => (
                    <option key={flat.id} value={flat.id}>
                      Flat {flat.flat_number}
                      {flat.floor_number && ` (Floor ${flat.floor_number})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Type Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Type
                </label>
                <select
                  value={selectedRoleType}
                  onChange={(e) => setSelectedRoleType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="Tanent-O">Owner Tenant (Tanent-O)</option>
                  <option value="Tanent-M">Member Tenant (Tanent-M)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-lightBackground p-4 rounded-lg">
                <p className="text-sm text-hintText">Total Tenants</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600">Tanent-O</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.tenantO}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-600">Tanent-M</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.tenantM}
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <p className="text-sm text-emerald-600">Active</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.active}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-600">Occupied Flats</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.occupiedFlats}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants List Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-lightBackground">
              <FaUserCircle className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-primary">Tenants List</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-hintText">
              Sorted by:{" "}
              <span className="font-medium capitalize text-primary">
                {sortConfig.key}
              </span>
              <span className="ml-1">({sortConfig.direction})</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-hintText">Loading tenants...</p>
          </div>
        ) : sortedTenants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No tenants found
            </h3>
            <p className="text-hintText">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table View for Desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-lightBackground">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors min-w-[200px]"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center">
                          Tenant Details
                          {getSortIcon("name")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors min-w-[180px]"
                        onClick={() => requestSort("email")}
                      >
                        <div className="flex items-center">
                          Contact Info
                          {getSortIcon("email")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors min-w-[120px]"
                        onClick={() => requestSort("role_type")}
                      >
                        <div className="flex items-center">
                          Type
                          {getSortIcon("role_type")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors min-w-[220px]"
                        onClick={() => requestSort("building_name")}
                      >
                        <div className="flex items-center">
                          Property Details
                          {getSortIcon("building_name")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/10 transition-colors min-w-[140px]"
                        onClick={() => requestSort("move_in_date")}
                      >
                        <div className="flex items-center">
                          Move In Date
                          {getSortIcon("move_in_date")}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider min-w-[130px]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedTenants.map((tenant) => (
                      <tr
                        key={tenant.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Tenant Details Column */}
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {tenant.profile_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
                                  src={tenant.profile_url}
                                  alt={tenant.name || "Tenant"}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold border-2 border-primary/30">
                                  {tenant.name?.charAt(0) || "T"}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {tenant.name || "Unnamed Tenant"}
                              </div>
                              <div className="text-xs text-hintText truncate">
                                ID: {tenant.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info Column */}
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            <div className="flex items-start gap-1">
                              <FaEnvelope className="w-3 h-3 text-hintText mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-900 truncate">
                                {tenant.email || "No email"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaPhone className="w-3 h-3 text-hintText flex-shrink-0" />
                              <span className="text-sm text-gray-900 truncate">
                                {tenant.number || "No phone"}
                              </span>
                            </div>
                            {tenant.whatsapp_number && (
                              <div className="flex items-center gap-1">
                                <FaWhatsapp className="w-3 h-3 text-success flex-shrink-0" />
                                <span className="text-xs text-hintText truncate">
                                  {tenant.whatsapp_number}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Type Column */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium truncate ${getRoleTypeColor(
                                tenant.role_type,
                              )}`}
                            >
                              {tenant.role_type || "Unknown"}
                            </span>
                          </div>
                        </td>

                        {/* Property Details Column */}
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            {/* Building Info */}
                            <div className="flex items-center gap-2">
                              <FaBuilding className="w-3 h-3 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {tenant.building_name}
                              </span>
                            </div>

                            {/* Flat and Floor Info */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <FaDoorOpen className="w-3 h-3 text-hintText" />
                                <span className="text-xs text-gray-600">
                                  Flat {tenant.flat_number}
                                </span>
                              </div>

                              {tenant.floor_number !== "N/A" && (
                                <div className="flex items-center gap-1">
                                  <FaLayerGroup className="w-3 h-3 text-hintText" />
                                  <span className="text-xs text-gray-600">
                                    Floor {tenant.floor_number}
                                  </span>
                                </div>
                              )}

                              {tenant.bhk_type !== "N/A" && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs ${getBHKColor(
                                    tenant.bhk_type,
                                  )}`}
                                >
                                  {tenant.bhk_type}
                                </span>
                              )}
                            </div>

                            {/* Type and Status Chips */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${getBuildingTypeColor(
                                  tenant.building_type,
                                )}`}
                              >
                                {tenant.building_type || "N/A"}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded text-xs ${getOccupancyColor(
                                  tenant.occupancy_status,
                                )}`}
                              >
                                {tenant.occupancy_status}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Move In Date Column */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <FaCalendarAlt className="w-3 h-3 text-hintText" />
                              <span className="text-sm text-gray-900">
                                {formatDate(tenant.move_in_date)}
                              </span>
                            </div>
                            {tenant.move_out_date && (
                              <div className="text-xs text-reject">
                                Out: {formatDate(tenant.move_out_date)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(
                                tenant.is_active,
                              )}`}
                            >
                              {tenant.is_active ? (
                                <FaCheckCircle className="w-3 h-3" />
                              ) : (
                                <FaTimesCircle className="w-3 h-3" />
                              )}
                              <span className="truncate">
                                {tenant.is_active ? "Active" : "Inactive"}
                              </span>
                            </span>
                            <div className="text-xs text-hintText truncate">
                              {formatDate(
                                tenant.updated_at || tenant.created_at,
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card View for Mobile & Tablet */}
            <div className="lg:hidden space-y-4">
              {sortedTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
                >
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        {tenant.profile_url ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                            src={tenant.profile_url}
                            alt={tenant.name || "Tenant"}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg border-2 border-primary/30">
                            {tenant.name?.charAt(0) || "T"}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1">
                          {tenant.is_active ? (
                            <FaCheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <FaTimesCircle className="w-5 h-5 text-reject" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {tenant.name || "Unnamed Tenant"}
                          </h3>
                          <button
                            onClick={() =>
                              setExpandedTenant(
                                expandedTenant === tenant.id ? null : tenant.id,
                              )
                            }
                            className="text-primary p-1 flex-shrink-0"
                          >
                            {expandedTenant === tenant.id ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getRoleTypeColor(
                              tenant.role_type,
                            )}`}
                          >
                            {tenant.role_type}
                          </span>
                          <span className="text-xs text-hintText flex items-center gap-1">
                            <FaHashtag className="w-3 h-3" />
                            ID: {tenant.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {tenant.email || "No email"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {tenant.number || "No phone"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaBuilding className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tenant.building_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaDoorOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        Flat {tenant.flat_number}
                      </span>
                    </div>
                  </div>

                  {/* Property Details Chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tenant.bhk_type !== "N/A" && (
                      <span
                        className={`px-2 py-1 rounded text-xs ${getBHKColor(
                          tenant.bhk_type,
                        )}`}
                      >
                        {tenant.bhk_type}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs ${getBuildingTypeColor(
                        tenant.building_type,
                      )}`}
                    >
                      {tenant.building_type}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getOccupancyColor(
                        tenant.occupancy_status,
                      )}`}
                    >
                      {tenant.occupancy_status}
                    </span>
                  </div>

                  {/* Expanded Details */}
                  {expandedTenant === tenant.id && (
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      {/* Contact Details */}
                      {tenant.whatsapp_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaWhatsapp className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="truncate">
                            WhatsApp: {tenant.whatsapp_number}
                          </span>
                        </div>
                      )}

                      {/* Move Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        {tenant.move_in_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaCalendarAlt className="w-4 h-4 text-hintText flex-shrink-0" />
                            <div>
                              <div className="text-xs text-hintText">
                                Move In
                              </div>
                              <div className="text-sm text-gray-900">
                                {formatDate(tenant.move_in_date)}
                              </div>
                            </div>
                          </div>
                        )}
                        {tenant.move_out_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaCalendarAlt className="w-4 h-4 text-reject flex-shrink-0" />
                            <div>
                              <div className="text-xs text-hintText">
                                Move Out
                              </div>
                              <div className="text-sm text-reject">
                                {formatDate(tenant.move_out_date)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      {tenant.floor_number !== "N/A" && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaLayerGroup className="w-4 h-4 text-hintText flex-shrink-0" />
                          <span>Floor: {tenant.floor_number}</span>
                        </div>
                      )}

                      {/* Last Updated */}
                      <div className="text-xs text-hintText">
                        Last Updated:{" "}
                        {formatDate(tenant.updated_at || tenant.created_at)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
