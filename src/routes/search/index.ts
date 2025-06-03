import express from 'express';
import { NotFoundResponse, SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { DoctorModel } from '../../database/model/Doctor';
import { PharmacyModel } from '../../database/model/Pharmacy';
import { MedicationModel } from '../../database/model/Medication';
import { AmbulanceModel } from '../../database/model/Ambulance';
import calculateDistance from '../../helpers/calculateDistance';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

// Advanced search for doctors
router.get(
  '/doctors',
  validator(schema.searchDoctors),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      query,
      specialization,
      hospital,
      minFee,
      maxFee,
      yearsOfExperience,
      page = 1,
      limit = 10,
    } = req.query;

    const searchQuery: any = { status: true };

    // Text search across multiple fields
    if (query) {
      searchQuery.$or = [
        { specialization: { $regex: query, $options: 'i' } },
        { hospital: { $regex: query, $options: 'i' } },
        { qualification: { $regex: query, $options: 'i' } },
        { education: { $elemMatch: { $regex: query, $options: 'i' } } },
        { certifications: { $elemMatch: { $regex: query, $options: 'i' } } },
      ];
    }

    // Filter by specialization
    if (specialization) {
      searchQuery.specialization = { $regex: specialization, $options: 'i' };
    }

    // Filter by hospital
    if (hospital) {
      searchQuery.hospital = { $regex: hospital, $options: 'i' };
    }

    // Filter by consultation fee range
    if (minFee !== undefined || maxFee !== undefined) {
      searchQuery.consultationFee = {};
      if (minFee !== undefined)
        searchQuery.consultationFee.$gte = Number(minFee);
      if (maxFee !== undefined)
        searchQuery.consultationFee.$lte = Number(maxFee);
    }

    // Filter by years of experience
    if (yearsOfExperience !== undefined) {
      searchQuery.yearsOfExperience = { $gte: Number(yearsOfExperience) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [doctors, total] = await Promise.all([
      DoctorModel.find(searchQuery)
        .populate('user', 'name email profilePicUrl')
        .sort({ yearsOfExperience: -1, consultationFee: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec(),
      DoctorModel.countDocuments(searchQuery),
    ]);

    new SuccessResponse('Doctors found successfully', {
      doctors,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
        hasMore: skip + doctors.length < total,
      },
    }).send(res);
  }),
);

// Advanced search for pharmacies
router.get(
  '/pharmacies',
  validator(schema.searchPharmacies),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      query,
      city,
      state,
      services,
      hasInsuranceSupport,
      acceptedInsuranceProviders,
      page = 1,
      limit = 10,
    } = req.query;

    const searchQuery: any = { status: true };

    // Text search across multiple fields
    if (query) {
      searchQuery.$or = [
        { address: { $regex: query, $options: 'i' } },
        { services: { $elemMatch: { $regex: query, $options: 'i' } } },
        { licenseNumber: { $regex: query, $options: 'i' } },
      ];
    }

    // Filter by city
    if (city) {
      searchQuery.address = { $regex: city, $options: 'i' };
    }

    // Filter by state (assuming state is part of address)
    if (state) {
      searchQuery.address = { $regex: state, $options: 'i' };
    }

    // Filter by services
    if (services && Array.isArray(services)) {
      searchQuery.services = { $in: services };
    }

    // Filter by insurance support
    if (hasInsuranceSupport !== undefined) {
      searchQuery.hasInsuranceSupport = hasInsuranceSupport === 'true';
    }

    // Filter by accepted insurance providers
    if (
      acceptedInsuranceProviders &&
      Array.isArray(acceptedInsuranceProviders)
    ) {
      searchQuery.acceptedInsuranceProviders = {
        $in: acceptedInsuranceProviders,
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [pharmacies, total] = await Promise.all([
      PharmacyModel.find(searchQuery)
        .populate('user', 'name email profilePicUrl')
        .sort({ hasInsuranceSupport: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec(),
      PharmacyModel.countDocuments(searchQuery),
    ]);

    if (!pharmacies.length) {
      return new NotFoundResponse('No pharmacies found').send(res);
    }

    new SuccessResponse('Pharmacies found successfully', {
      pharmacies,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
        hasMore: skip + pharmacies.length < total,
      },
    }).send(res);
  }),
);

// Advanced search for medications
router.get(
  '/medications',
  validator(schema.searchMedications),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      query,
      category,
      manufacturer,
      dosageForm,
      prescriptionRequired,
      page = 1,
      limit = 10,
    } = req.query;

    const searchQuery: any = { status: true };

    // Text search across multiple fields
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { manufacturer: { $regex: query, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      searchQuery.category = { $regex: category, $options: 'i' };
    }

    // Filter by manufacturer
    if (manufacturer) {
      searchQuery.manufacturer = { $regex: manufacturer, $options: 'i' };
    }

    // Filter by dosage form
    if (dosageForm) {
      searchQuery.dosageForm = { $regex: dosageForm, $options: 'i' };
    }

    // Filter by prescription requirement
    if (prescriptionRequired !== undefined) {
      searchQuery.prescriptionRequired = prescriptionRequired === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [medications, total] = await Promise.all([
      MedicationModel.find(searchQuery)
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec(),
      MedicationModel.countDocuments(searchQuery),
    ]);
    if (!medications.length) {
      return new NotFoundResponse('No medications found').send(res);
    }

    new SuccessResponse('Medications found successfully', {
      medications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
        hasMore: skip + medications.length < total,
      },
    }).send(res);
  }),
);

// Search for healthcare services
router.get(
  '/services',
  validator(schema.searchServices),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { query, serviceType, location, page = 1, limit = 10 } = req.query;

    const services: any = {
      medical: [],
      pharmacy: [],
      laboratory: [],
      ambulance: [],
      telemedicine: [],
    };

    // Search based on service type or all types
    const searchTypes = serviceType
      ? [serviceType as string]
      : Object.keys(services);

    for (const type of searchTypes) {
      const baseSearchQuery: any = { status: true };
      let results: any[] = [];

      if (location) {
        baseSearchQuery.$or = [
          { address: { $regex: location, $options: 'i' } },
          { hospital: { $regex: location, $options: 'i' } },
          { serviceArea: { $elemMatch: { $regex: location, $options: 'i' } } },
        ];
      }

      switch (type) {
        case 'medical':
          if (query) {
            baseSearchQuery.$or = [
              ...(baseSearchQuery.$or || []),
              { specialization: { $regex: query, $options: 'i' } },
              { hospital: { $regex: query, $options: 'i' } },
              { qualification: { $regex: query, $options: 'i' } },
            ];
          }
          results = await DoctorModel.find(baseSearchQuery)
            .populate('user', 'name email profilePicUrl')
            .limit(Number(limit))
            .lean()
            .exec();
          break;

        case 'pharmacy':
          if (query) {
            baseSearchQuery.$or = [
              ...(baseSearchQuery.$or || []),
              { services: { $elemMatch: { $regex: query, $options: 'i' } } },
              { address: { $regex: query, $options: 'i' } },
            ];
          }
          results = await PharmacyModel.find(baseSearchQuery)
            .populate('user', 'name email profilePicUrl')
            .limit(Number(limit))
            .lean()
            .exec();
          break;

        case 'ambulance':
          if (query) {
            baseSearchQuery.$or = [
              ...(baseSearchQuery.$or || []),
              {
                vehicleTypes: { $elemMatch: { $regex: query, $options: 'i' } },
              },
              { serviceArea: { $elemMatch: { $regex: query, $options: 'i' } } },
              { equipments: { $elemMatch: { $regex: query, $options: 'i' } } },
            ];
          }
          results = await AmbulanceModel.find(baseSearchQuery)
            .populate('user', 'name email profilePicUrl')
            .limit(Number(limit))
            .lean()
            .exec();
          break;

        case 'laboratory':
          // Laboratory services can be found in pharmacy services
          if (query) {
            baseSearchQuery.services = {
              $elemMatch: { $regex: 'lab|diagnostic|test', $options: 'i' },
            };
          }
          results = await PharmacyModel.find(baseSearchQuery)
            .populate('user', 'name email profilePicUrl')
            .limit(Number(limit))
            .lean()
            .exec();
          break;

        case 'telemedicine':
          // Telemedicine can be found in doctor services
          if (query) {
            baseSearchQuery.$or = [
              ...(baseSearchQuery.$or || []),
              { specialization: { $regex: query, $options: 'i' } },
            ];
          }
          // Add filter for doctors who offer telemedicine (this would need to be added to the model)
          results = await DoctorModel.find(baseSearchQuery)
            .populate('user', 'name email profilePicUrl')
            .limit(Number(limit))
            .lean()
            .exec();
          break;
      }

      services[type] = results.map((item: any) => ({
        ...item,
        serviceType: type,
      }));
    }

    // Flatten results if searching all services
    let allServices = [];
    if (!serviceType) {
      allServices = Object.values(services).flat();
    } else {
      allServices = services[serviceType as string] || [];
    }

    new SuccessResponse('Healthcare services found successfully', {
      services: serviceType ? services[serviceType as string] : services,
      total: allServices.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: allServices.length,
      },
    }).send(res);
  }),
);

// Find nearby healthcare facilities
router.get(
  '/nearby',
  validator(schema.searchNearby),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      latitude,
      longitude,
      radius = 10,
      facilityType = 'all',
      page = 1,
      limit = 10,
    } = req.query;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusKm = Number(radius);

    // Convert radius from kilometers to radians (Earth's radius ≈ 6371 km)
    const radiusRadians = radiusKm / 6371;

    const geoQuery = {
      'coordinates.latitude': { $exists: true },
      'coordinates.longitude': { $exists: true },
      coordinates: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusRadians],
        },
      },
    };

    const results: any = {
      doctors: [],
      pharmacies: [],
      hospitals: [],
      ambulances: [],
    };

    const searchTypes =
      facilityType === 'all'
        ? ['doctors', 'pharmacies', 'ambulances']
        : [facilityType as string];

    for (const type of searchTypes) {
      let facilities: any[] = [];

      switch (type) {
        case 'doctors':
          // For doctors, we might need to search by hospital coordinates or add coordinates to doctor model
          // For now, search all doctors and calculate distance if coordinates exist
          facilities = await DoctorModel.find({ status: true })
            .populate('user', 'name email profilePicUrl')
            .limit(Number(limit))
            .lean()
            .exec();
          break;

        case 'pharmacies':
          facilities = await PharmacyModel.find({
            ...geoQuery,
            status: true,
          })
            .populate('user', 'name email profilePicUrl')
            .limit(Number(limit))
            .lean()
            .exec();
          break;

        case 'ambulances':
          facilities = await AmbulanceModel.find({
            'baseLocation.coordinates.latitude': { $exists: true },
            'baseLocation.coordinates.longitude': { $exists: true },
            status: true,
          })
            .populate('user', 'name email profilePicUrl')
            .limit(Number(limit))
            .lean()
            .exec();

          // Filter ambulances by distance
          facilities = facilities.filter((ambulance: any) => {
            if (ambulance.baseLocation?.coordinates) {
              const distance = calculateDistance(
                lat,
                lng,
                ambulance.baseLocation.coordinates.latitude,
                ambulance.baseLocation.coordinates.longitude,
              );
              ambulance.distance = Math.round(distance * 100) / 100; // Round to 2 decimal places
              return distance <= radiusKm;
            }
            return false;
          });
          break;
      }

      // Calculate distances for facilities with coordinates
      facilities = facilities.map((facility: any) => {
        let coords = null;
        if (facility.coordinates) {
          coords = facility.coordinates;
        } else if (facility.baseLocation?.coordinates) {
          coords = facility.baseLocation.coordinates;
        }

        if (coords && coords.latitude && coords.longitude) {
          const distance = calculateDistance(
            lat,
            lng,
            coords.latitude,
            coords.longitude,
          );
          return {
            ...facility,
            distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
            facilityType: type.endsWith('s') ? type.slice(0, -1) : type, // Remove 's' from plural
          };
        }

        return {
          ...facility,
          facilityType: type.endsWith('s') ? type.slice(0, -1) : type, // Remove 's' from plural
        };
      });

      // Sort by distance
      facilities.sort(
        (a: any, b: any) => (a.distance || 999) - (b.distance || 999),
      );

      results[type] = facilities;
    }

    // Flatten results if searching all facilities
    let allFacilities = [];
    if (facilityType === 'all') {
      allFacilities = Object.values(results).flat();
      // Sort all facilities by distance
      allFacilities.sort(
        (a: any, b: any) => (a.distance || 999) - (b.distance || 999),
      );
    } else {
      allFacilities = results[facilityType as string] || [];
    }
    if (!allFacilities.length) {
      return new NotFoundResponse('No facilities found').send(res);
    }

    new SuccessResponse('Nearby facilities found successfully', {
      facilities:
        facilityType === 'all'
          ? allFacilities
          : results[facilityType as string],
      searchCenter: { latitude: lat, longitude: lng },
      radius: radiusKm,
      pagination: {
        total: allFacilities.length,
        page: Number(page),
        limit: Number(limit),
      },
    }).send(res);
  }),
);

export default router;
