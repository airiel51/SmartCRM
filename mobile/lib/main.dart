import 'package:flutter/material.dart';
import 'screens/bays_screen.dart';
import 'screens/intake_screen.dart';
import 'screens/retention_screen.dart';
import 'screens/fleet_screen.dart';

void main() {
  runApp(const ApexAutoWorksApp());
}

class ApexAutoWorksApp extends StatelessWidget {
  const ApexAutoWorksApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Apex AutoWorks',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: Colors.amber,
        colorScheme: ColorScheme.dark(
          primary: Colors.amber,
          secondary: Colors.amber.shade700,
          surface: const Color(0xFF1E293B),
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const MainWorkshopNavigation(),
    );
  }
}

class MainWorkshopNavigation extends StatefulWidget {
  const MainWorkshopNavigation({Key? key}) : super(key: key);

  @override
  State<MainWorkshopNavigation> createState() => _MainWorkshopNavigationState();
}

class _MainWorkshopNavigationState extends State<MainWorkshopNavigation> {
  int _currentIndex = 0;
  String? _preselectedBay;

  void _navigateTab(int index, {String? defaultBay}) {
    setState(() {
      _currentIndex = index;
      _preselectedBay = defaultBay;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      BaysScreen(onNavigateTab: _navigateTab),
      IntakeScreen(
        initialBay: _preselectedBay,
        onIntakeCreated: () => _navigateTab(0),
      ),
      const RetentionScreen(),
      const FleetScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          backgroundColor: const Color(0xFF1E293B),
          indicatorColor: Colors.amber.withOpacity(0.2),
          labelTextStyle: WidgetStateProperty.resolveWith<TextStyle>((states) {
            if (states.contains(WidgetState.selected)) {
              return const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold);
            }
            return const TextStyle(color: Colors.white54, fontSize: 11);
          }),
          iconTheme: WidgetStateProperty.resolveWith<IconThemeData>((states) {
            if (states.contains(WidgetState.selected)) {
              return const IconThemeData(color: Colors.amber, size: 22);
            }
            return const IconThemeData(color: Colors.white54, size: 22);
          }),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.car_repair_outlined),
              selectedIcon: Icon(Icons.car_repair_rounded),
              label: 'Bays',
            ),
            NavigationDestination(
              icon: Icon(Icons.add_circle_outline_rounded),
              selectedIcon: Icon(Icons.add_circle_rounded),
              label: 'Check-In',
            ),
            NavigationDestination(
              icon: Icon(Icons.chat_bubble_outline_rounded),
              selectedIcon: Icon(Icons.chat_bubble_rounded),
              label: 'Reminders',
            ),
            NavigationDestination(
              icon: Icon(Icons.people_outline_rounded),
              selectedIcon: Icon(Icons.people_rounded),
              label: 'Customers',
            ),
          ],
        ),
      ),
    );
  }
}
